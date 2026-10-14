const express = require('express');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const BloodReport = require('../models/BloodReport');
const { analyzeReport } = require('../services/ai/reportService');

const router = express.Router();

/**
 * Extract text from a PDF file using pdf-parse.
 */
async function extractTextFromPDF(filePath) {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || '';
}

/**
 * Extract text from an image using tesseract.js OCR.
 */
async function extractTextFromImage(filePath) {
  const { createWorker } = require('tesseract.js');
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text || '';
}

/**
 * POST /api/reports/upload
 * Upload a blood report (PDF, image, or plain text).
 */
router.post('/upload', auth, upload.single('report'), async (req, res) => {
  try {
    let extractedText = '';
    let fileUrl = '';
    let fileType = 'text';
    let originalFilename = '';

    if (req.file) {
      // File upload (PDF or image)
      const filePath = req.file.path;
      fileUrl = `/uploads/${req.file.filename}`;
      originalFilename = req.file.originalname;

      if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
        extractedText = await extractTextFromPDF(filePath);
      } else if (req.file.mimetype.startsWith('image/')) {
        fileType = 'image';
        extractedText = await extractTextFromImage(filePath);
      }

      if (!extractedText || extractedText.trim().length < 5) {
        return res.status(422).json({
          error: 'Text extraction failed',
          message: 'Could not extract readable text from the uploaded file. Please try uploading a clearer file or paste the report text directly.',
        });
      }
    } else if (req.body.rawText) {
      // Plain text input
      fileType = 'text';
      extractedText = req.body.rawText.trim();

      if (extractedText.length < 10) {
        return res.status(400).json({
          error: 'Insufficient text',
          message: 'Please provide more report data (at least 10 characters).',
        });
      }
    } else {
      return res.status(400).json({
        error: 'No report provided',
        message: 'Please upload a PDF/image file or paste your report text.',
      });
    }

    // Optionally link to a symptom check
    const symptomCheckId = req.body.symptomCheckId || null;

    // Save report
    const report = new BloodReport({
      userId: req.userId,
      fileUrl,
      rawText: req.body.rawText || '',
      extractedText,
      fileType,
      originalFilename,
      symptomCheckId,
      analysis: { status: 'pending' },
    });

    await report.save();

    res.status(201).json({
      message: 'Report uploaded successfully',
      reportId: report._id,
      fileType,
      extractedTextLength: extractedText.length,
    });
  } catch (error) {
    console.error('Report upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Failed to upload report. Please try again.',
    });
  }
});

/**
 * POST /api/reports/:id/analyze
 * Analyze an uploaded blood report using AI.
 */
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const report = await BloodReport.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'The requested report was not found or does not belong to you.',
      });
    }

    if (!report.extractedText || report.extractedText.trim().length < 5) {
      return res.status(422).json({
        error: 'No text to analyze',
        message: 'The report does not contain sufficient text for analysis.',
      });
    }

    // Call AI service
    const analysis = await analyzeReport(report.extractedText);

    // Update report with analysis results
    report.documentName = analysis.documentName;
    report.analysis = {
      status: analysis.status,
      findings: analysis.findings,
      summary: analysis.summary,
      analyzedAt: new Date(),
    };

    await report.save();

    res.json({
      message: 'Report analyzed successfully',
      report: {
        _id: report._id,
        documentName: report.documentName,
        fileType: report.fileType,
        originalFilename: report.originalFilename,
        analysis: report.analysis,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Report analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'Failed to analyze report. Please try again.',
    });
  }
});

/**
 * GET /api/reports/:id
 * Get a specific report with its analysis.
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await BloodReport.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'The requested report was not found or does not belong to you.',
      });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      error: 'Failed to fetch report',
      message: 'An error occurred while fetching the report.',
    });
  }
});

/**
 * GET /api/reports
 * Get all reports for the current user.
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      BloodReport.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-extractedText -rawText')
        .lean(),
      BloodReport.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      error: 'Failed to fetch reports',
      message: 'An error occurred while fetching your reports.',
    });
  }
});

module.exports = router;
