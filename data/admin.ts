import { IObjectAny, IAdminDocument } from './../types';
import Admin from './AdminSchema';

/*------------------
ADMINS SETTINGS API
------------------*/

/**
 * Database error handler
 * @param {IObjectAny}
 * @return {IObjectAny} Error object
 */
const dbErrHandler = (err: IObjectAny): IObjectAny => {
  const errMsg = `ADMIN SETTINGS DB Error: ${err.message || err}`;
  console.error(errMsg);
  return new Error(errMsg);
};

/**
 * Exported object containing API endpoints
 */
const adminApi: IObjectAny = {
  /**
   * Initialize and set settings from ENV if there are no settings in DB
   * @return {Promise<IAdminDocument>} promise: admin settings document
   */
  async initSettings(): Promise<IAdminDocument> {
    return Admin.findOne({}, (err: IObjectAny, settings: IAdminDocument) => {
      if (err) return dbErrHandler(err);
      if (!settings) {
        const newSettings: IAdminDocument = new Admin({
          channel: process.env.SLACK_CHANNEL_ID,
          admins: process.env.SLACK_ADMINS.split(',')
        });
        newSettings.save((err) => {
          if (err) return dbErrHandler(err);
          console.log('ADMIN DB: Set new admin settings from environment variables');
          return newSettings;
        });
      }
    });
  },
  /**
   * Get settings object
   * @return {Promise<IAdminDocument>} promise: admin settings document
   */
  async getSettings(): Promise<IAdminDocument> {
    return Admin.findOne({}, (err: IObjectAny, settings: IAdminDocument) => {
      if (err) return dbErrHandler(err);
      if (!settings) return new Error('ADMIN DB: No admin settings are saved');
      return settings;
    });
  },
  /**
   * Save reporting channel to store
   * @param {string} channel channel ID to save to DB
   * @return {Promise<IAdminDocument>} promise: admin settings document
   */
  async setChannel(channel: string): Promise<IAdminDocument> {
    return Admin.findOne({}, (err: IObjectAny, settings: IAdminDocument) => {
      if (err) return dbErrHandler(err);
      if (!channel) return dbErrHandler({message: 'No channel provided'});
      // No settings exist yet; save new settings document
      if (!settings) {
        const newSettings: IAdminDocument = new Admin({
          channel: channel,
          admins: process.env.SLACK_ADMINS.split(',')
        });
        newSettings.save((err: IObjectAny) => {
          if (err) return dbErrHandler(err);
          return newSettings;
        });
      }
      // Update existing settings object
      else {
        settings.channel = channel;
        settings.save((err: IObjectAny) => {
          if (err) return dbErrHandler(err);
          console.log('ADMIN DB: successfully set channel to', settings.channel);
          return settings;
        });
      }
    });
  },
  /**
   * Save admins to settings
   * @param {string[]} admins array of Slack user IDs for admins
   * @return {Promise<IAdminDocument>} promise: new settings
   */
  async setAdmins(admins: string[]): Promise<IAdminDocument> {
    return Admin.findOne({}, (err: IObjectAny, settings: IAdminDocument) => {
      if (err) return dbErrHandler(err);
      if (!admins || !admins.length) return dbErrHandler({message: 'No users provided'});
      // No settings exist yet; save new settings document
      if (!settings) {
        const newSettings: IAdminDocument = new Admin({
          channel: process.env.SLACK_CHANNEL_ID,
          admins: admins
        });
        newSettings.save((err: IObjectAny) => {
          if (err) return dbErrHandler(err);
          return newSettings;
        });
      }
      // Update existing settings object
      else {
        settings.admins = admins;
        settings.save((err: IObjectAny) => {
          if (err) return dbErrHandler(err);
          console.log('ADMIN DB: successfully updated admin list to', settings.admins);
          return settings;
        });
      }
    });
  }
};

export default adminApi;