const jwt = require('jsonwebtoken');
const SosLog = require('../models/SosLog');
const User = require('../models/User');

/**
 * Setup the /emergency Socket.io namespace with JWT authentication.
 *
 * Events:
 *   sos:trigger        - Patient triggers an emergency SOS
 *   sos:acknowledge     - Doctor/admin acknowledges an SOS
 *   sos:resolve        - Resolves an active SOS
 *   sos:get-active     - Request list of all active SOS alerts
 *
 * Broadcasts:
 *   sos:incoming       - Sent to doctors/admins when a new SOS is triggered
 *   sos:status-update  - Sent when an SOS status changes
 *   sos:updated        - Sent when an SOS is updated
 *   sos:active-list    - Response to sos:get-active
 */
function setupEmergencySocket(io) {
  const emergencyNs = io.of('/emergency');

  // JWT Authentication middleware for socket connections
  emergencyNs.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash').lean();

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  emergencyNs.on('connection', (socket) => {
    console.log(`🔌 Emergency socket connected: ${socket.user.name} (${socket.userRole})`);

    // Join role-based rooms for targeted broadcasts
    socket.join(`role:${socket.userRole}`);
    socket.join(`user:${socket.userId}`);

    /**
     * sos:trigger - Patient triggers an emergency SOS
     */
    socket.on('sos:trigger', async (data, callback) => {
      try {
        const sosLog = new SosLog({
          userId: socket.userId,
          status: 'active',
          location: {
            lat: data?.lat || null,
            lng: data?.lng || null,
          },
          message: data?.message || '',
        });

        await sosLog.save();

        // Broadcast to all doctors and admins
        emergencyNs.to('role:doctor').to('role:admin').emit('sos:incoming', {
          sosId: sosLog._id,
          userId: socket.userId,
          userName: socket.user.name,
          location: sosLog.location,
          message: sosLog.message,
          status: 'active',
          createdAt: sosLog.createdAt,
        });

        // Confirm to the patient
        if (typeof callback === 'function') {
          callback({
            success: true,
            sosId: sosLog._id,
            message: 'SOS alert sent. Help is on the way.',
          });
        }

        // Also emit status update to the patient
        socket.emit('sos:status-update', {
          sosId: sosLog._id,
          status: 'active',
          message: 'Your SOS alert has been sent to available medical professionals.',
        });
      } catch (error) {
        console.error('SOS trigger error:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Failed to send SOS alert.' });
        }
      }
    });

    /**
     * sos:acknowledge - Doctor/admin acknowledges an SOS
     */
    socket.on('sos:acknowledge', async (data, callback) => {
      try {
        if (!['doctor', 'admin'].includes(socket.userRole)) {
          if (typeof callback === 'function') {
            callback({ success: false, message: 'Only doctors and admins can acknowledge SOS alerts.' });
          }
          return;
        }

        const sosLog = await SosLog.findByIdAndUpdate(
          data.sosId,
          {
            status: 'acknowledged',
            acknowledgedBy: socket.userId,
            acknowledgedAt: new Date(),
          },
          { new: true }
        );

        if (!sosLog) {
          if (typeof callback === 'function') {
            callback({ success: false, message: 'SOS alert not found.' });
          }
          return;
        }

        // Notify the patient
        emergencyNs.to(`user:${sosLog.userId.toString()}`).emit('sos:status-update', {
          sosId: sosLog._id,
          status: 'acknowledged',
          acknowledgedBy: socket.user.name,
          message: `Your SOS has been acknowledged by ${socket.user.name}.`,
        });

        // Notify all doctors/admins
        emergencyNs.to('role:doctor').to('role:admin').emit('sos:updated', {
          sosId: sosLog._id,
          status: 'acknowledged',
          acknowledgedBy: socket.user.name,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: 'SOS acknowledged.' });
        }
      } catch (error) {
        console.error('SOS acknowledge error:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Failed to acknowledge SOS.' });
        }
      }
    });

    /**
     * sos:resolve - Resolves an active SOS
     */
    socket.on('sos:resolve', async (data, callback) => {
      try {
        const sosLog = await SosLog.findByIdAndUpdate(
          data.sosId,
          {
            status: 'resolved',
            resolvedAt: new Date(),
          },
          { new: true }
        );

        if (!sosLog) {
          if (typeof callback === 'function') {
            callback({ success: false, message: 'SOS alert not found.' });
          }
          return;
        }

        // Notify the patient
        emergencyNs.to(`user:${sosLog.userId.toString()}`).emit('sos:status-update', {
          sosId: sosLog._id,
          status: 'resolved',
          message: 'Your SOS alert has been resolved.',
        });

        // Notify all doctors/admins
        emergencyNs.to('role:doctor').to('role:admin').emit('sos:updated', {
          sosId: sosLog._id,
          status: 'resolved',
          resolvedBy: socket.user.name,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: 'SOS resolved.' });
        }
      } catch (error) {
        console.error('SOS resolve error:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Failed to resolve SOS.' });
        }
      }
    });

    /**
     * sos:get-active - Request list of all active SOS alerts
     */
    socket.on('sos:get-active', async (data, callback) => {
      try {
        const filter = { status: { $in: ['active', 'acknowledged'] } };

        // Patients can only see their own alerts
        if (socket.userRole === 'patient') {
          filter.userId = socket.userId;
        }

        const activeAlerts = await SosLog.find(filter)
          .populate('userId', 'name email phone')
          .populate('acknowledgedBy', 'name')
          .sort({ createdAt: -1 })
          .lean();

        const formatted = activeAlerts.map(alert => ({
          sosId: alert._id,
          userId: alert.userId?._id,
          userName: alert.userId?.name,
          userPhone: alert.userId?.phone,
          status: alert.status,
          location: alert.location,
          message: alert.message,
          acknowledgedBy: alert.acknowledgedBy?.name || null,
          createdAt: alert.createdAt,
        }));

        socket.emit('sos:active-list', formatted);

        if (typeof callback === 'function') {
          callback({ success: true, count: formatted.length });
        }
      } catch (error) {
        console.error('Get active SOS error:', error);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Failed to fetch active alerts.' });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Emergency socket disconnected: ${socket.user.name}`);
    });
  });
}

module.exports = setupEmergencySocket;
