import SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamCommunity from 'steamcommunity';
import type CEconItem from 'steamcommunity/classes/CEconItem';
import type TradeOffer from 'steam-tradeoffer-manager/lib/classes/TradeOffer';
import { env } from '../config/env.ts';
import { logger } from '../utils/logger.ts';

class SteamBot {
  private client: SteamUser;
  private manager: TradeOfferManager;
  private community: SteamCommunity;
  private ready = false;

  constructor() {
    this.client = new SteamUser();
    this.community = new SteamCommunity();
    this.manager = new TradeOfferManager({
      steam: this.client,
      language: 'english',
      pollInterval: 10_000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('loggedOn', () => {
      logger.info('Steam bot logged in');
      this.client.setPersona(SteamUser.EPersonaState.Online);
    });

    this.client.on('webSession', (_sessionId: string, cookies: string[]) => {
      logger.info('Steam bot web session acquired');
      this.manager.setCookies(cookies);
      this.community.setCookies(cookies);
      this.community.startConfirmationChecker(30_000, env.STEAM_IDENTITY_SECRET);
      this.ready = true;
    });

    this.client.on('error', (err: Error) => {
      logger.error(err, 'Steam bot error');
      this.ready = false;
    });

    this.manager.on('sentOfferChanged', (offer: TradeOffer, oldState: number) => {
      logger.info({ offerId: offer.id, oldState, newState: offer.state }, 'Trade offer state changed');
    });

    this.manager.on('pollFailure', (err: Error) => {
      logger.error(err, 'Trade manager poll failure');
    });
  }

  login() {
    if (!env.STEAM_BOT_USERNAME || !env.STEAM_BOT_PASSWORD) {
      logger.warn('Steam bot credentials not configured, skipping login');
      return;
    }

    const twoFactorCode = SteamTotp.generateAuthCode(env.STEAM_SHARED_SECRET);

    this.client.logOn({
      accountName: env.STEAM_BOT_USERNAME,
      password: env.STEAM_BOT_PASSWORD,
      twoFactorCode,
    });
  }

  isReady(): boolean {
    return this.ready;
  }

  getInventory(): Promise<CEconItem[]> {
    return new Promise((resolve, reject) => {
      this.manager.getInventoryContents(730, 2, true, (err, inventory) => {
        if (err) return reject(err);
        resolve(inventory);
      });
    });
  }

  getTradeOfferState(offerId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.manager.getOffer(offerId, (err: Error | null, offer: TradeOffer) => {
        if (err) return reject(err);
        resolve(offer.state);
      });
    });
  }

  cancelTradeOffer(offerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.manager.getOffer(offerId, (err: Error | null, offer: TradeOffer) => {
        if (err) return reject(err);
        offer.cancel((cancelErr: Error | null) => {
          if (cancelErr) return reject(cancelErr);
          resolve();
        });
      });
    });
  }

  sendTradeOffer(
    partnerTradeUrl: string,
    items: CEconItem[],
  ): Promise<{ offerId: string; status: string }> {
    return new Promise((resolve, reject) => {
      const offer = this.manager.createOffer(partnerTradeUrl);

      for (const item of items) {
        offer.addMyItem(item);
      }

      offer.setMessage('Your CS2 skin shop purchase. Thanks!');

      offer.send((err, status) => {
        if (err) return reject(err);

        const offerId = String(offer.id);
        if (!offerId) {
          return reject(new Error('Trade offer sent but ID is missing'));
        }

        logger.info({ offerId, status }, 'Trade offer sent');

        this.community.acceptConfirmationForObject(
          env.STEAM_IDENTITY_SECRET,
          offerId,
          (confirmErr: Error | null) => {
            if (confirmErr) {
              logger.error(confirmErr, 'Failed to confirm trade offer');
              return reject(confirmErr);
            }
            resolve({ offerId, status });
          },
        );
      });
    });
  }
}

export const steamBot = new SteamBot();
