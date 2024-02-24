import mongoose from 'mongoose';

const CampaignStatisticSchema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed type to store any structure of data
  fetchedAt: { type: Date, default: Date.now, index: { expires: '1d' } } // Cache expires after 1 day
});

CampaignStatisticSchema.post('save', function(doc) {
  console.log(`Campaign statistics for campaign ID ${doc.campaignId} saved to cache.`);
});

CampaignStatisticSchema.post('error', function(error, doc, next) {
  console.error(`Error saving campaign statistics for campaign ID ${doc ? doc.campaignId : 'unknown'}: ${error}`, error.stack);
  next(error);
});

const CampaignStatistic = mongoose.model('CampaignStatistic', CampaignStatisticSchema);

export default CampaignStatistic;