import express from 'express';
import fetch from 'node-fetch'; // Ensure node-fetch is imported for making HTTP requests
import CampaignStatistic from '../models/CampaignStatistic.mjs';
import { isAuthenticated } from './middleware/authMiddleware.mjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route to fetch campaign analytics
router.get('/campaigns/:campaignId/analytics', isAuthenticated, async (req, res) => {
  try {
    const { campaignId } = req.params;
    if (!campaignId || campaignId.toLowerCase() === 'select a campaign') {
      console.log('Invalid or missing campaignId in request');
      return res.status(400).json({ error: 'Invalid or missing campaignId' });
    }
    console.log(`Fetching analytics for campaignId: ${campaignId}`);

    // Check if we have cached data
    const cachedData = await CampaignStatistic.findOne({ campaignId });
    if (cachedData) {
      console.log(`Found cached data for campaignId: ${campaignId}`);
      return res.json({
        Emails: {
          sent_count: cachedData.data.sent_count,
          reply_count: cachedData.data.reply_count,
          total_count: cachedData.data.total_count,
        },
        Leads: cachedData.data.campaign_lead_stats
      });
    }

    console.log(`No cached data found for campaignId: ${campaignId}, fetching from SmartLead API`);
    // If no cache, fetch from API
    const apiUrl = `${process.env.SMARTLEAD_API_BASE_URL}/campaigns/${campaignId}/analytics?api_key=${process.env.SMARTLEAD_API_KEY}&offset=0&limit=100`; // Adjusted endpoint, INPUT_REQUIRED {Set SMARTLEAD_API_BASE_URL and SMARTLEAD_API_KEY in your .env file}
    const response = await fetch(apiUrl).catch(error => {
      console.error(`Failed to fetch campaign analytics from SmartLead API for campaignId: ${campaignId}. Error: ${error.message}`, error.stack);
      return res.status(500).send('Failed to fetch campaign analytics from SmartLead API');
    });
    if (!response.ok) {
      console.error(`Failed to fetch campaign analytics from SmartLead API for campaignId: ${campaignId}. Status: ${response.statusText}`);
      throw new Error('Failed to fetch campaign analytics from SmartLead API');
    }
    const data = await response.json();

    // Process and format the data for frontend
    const formattedData = {
      Emails: {
        sent_count: data.sent_count,
        reply_count: data.reply_count,
        total_count: data.total_count,
      },
      Leads: data.campaign_lead_stats
    };

    console.log(`Sending formatted campaign data for campaignId: ${campaignId}`, formattedData);

    // Save fetched data to cache
    await CampaignStatistic.create({ campaignId, data: formattedData });
    console.log(`Cached new data for campaignId: ${campaignId}`);

    res.json(formattedData);
  } catch (error) {
    console.error(`Error fetching campaign analytics for campaignId: ${req.params.campaignId}: ${error.message}`, error.stack);
    res.status(500).send('Internal server error while fetching campaign analytics');
  }
});

export default router;