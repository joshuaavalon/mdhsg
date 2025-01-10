import { promises as fs } from "fs";
import os from "os";
import path from "path";

import { PuppeteerBlocker } from "@ghostery/adblocker-puppeteer";
import { PuppeteerExtraPlugin } from "puppeteer-extra-plugin";
import type { Page } from "puppeteer";

const engineCacheFilename = "puppeteer-extra-plugin-adblocker-2.13.6-engine.bin";

/** Available plugin options */
export interface PluginOptions {
  /** Whether or not to block trackers (in addition to ads). Default: false */
  blockTrackers: boolean;

  /** Whether or not to block trackers and other annoyances, including cookie
      notices. Default: false */
  blockTrackersAndAnnoyances: boolean;

  /** Optional custom directory for adblocker cache files. Default: undefined */
  cacheDir?: string;

  /** Optional custom priority for interception resolution. Default: undefined */
  interceptResolutionPriority?: number;

  /** Persist adblocker engine cache to disk for speedup. Default: true */
  useCache: boolean;
}

/**
 * A puppeteer-extra plugin to automatically block ads and trackers.
 */
export class PuppeteerExtraPluginAdblocker extends PuppeteerExtraPlugin {
  private blocker: PuppeteerBlocker | undefined;

  public constructor(opts: Partial<PluginOptions>) {
    super(opts);
    this.debug("Initialized", this.opts);
  }

  public override get name(): string {
    return "adblocker";
  }

  public override get defaults(): PluginOptions {
    return {
      blockTrackers: false,
      blockTrackersAndAnnoyances: false,
      cacheDir: undefined,
      interceptResolutionPriority: undefined,
      useCache: true
    };
  }

  public get engineCacheFile(): string {
    const cacheDir = this.opts.cacheDir || os.tmpdir();
    return path.join(cacheDir, engineCacheFilename);
  }

  /**
   * Cache an instance of `PuppeteerBlocker` to disk if 'cacheDir' option was
   * specified for the plugin. It can then be used the next time this plugin is
   * used to load the adblocker faster.
   */
  private async persistToCache(blocker: PuppeteerBlocker): Promise<void> {
    if (!this.opts.useCache) {
      return;
    }
    this.debug("persist to cache", this.engineCacheFile);
    await fs.writeFile(this.engineCacheFile, blocker.serialize());
  }

  /**
   * Initialize instance of `PuppeteerBlocker` from cache if possible.
   * Otherwise, it throws and we will try to initialize it from remote instead.
   */
  private async loadFromCache(): Promise<PuppeteerBlocker> {
    if (!this.opts.useCache) {
      throw new Error("caching disabled");
    }
    this.debug("load from cache", this.engineCacheFile);
    return PuppeteerBlocker.deserialize(new Uint8Array(await fs.readFile(this.engineCacheFile)));
  }

  /**
   * Initialize instance of `PuppeteerBlocker` from remote (either by fetching
   * a serialized version of the engine when available, or by downloading raw
   * lists for filters such as EasyList then parsing them to initialize
   * blocker).
   */
  private async loadFromRemote(): Promise<PuppeteerBlocker> {
    this.debug("load from remote", {
      blockTrackers: this.opts.blockTrackers,
      blockTrackersAndAnnoyances: this.opts.blockTrackersAndAnnoyances
    });
    if (this.opts.blockTrackersAndAnnoyances === true) {
      return PuppeteerBlocker.fromPrebuiltFull(fetch);
    } else if (this.opts.blockTrackers === true) {
      return PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
    }
    return PuppeteerBlocker.fromPrebuiltAdsOnly(fetch);
  }

  /**
   * Return instance of `PuppeteerBlocker`. It will take care of initializing
   * it if necessary (first time it is called), or return the existing instance
   * if it already exists.
   */
  public async getBlocker(): Promise<PuppeteerBlocker> {
    this.debug("getBlocker", { hasBlocker: !!this.blocker });
    if (this.blocker === undefined) {
      try {
        this.blocker = await this.loadFromCache();
        this.setRequestInterceptionPriority();
      } catch (_e) {
        this.blocker = await this.loadFromRemote();
        this.setRequestInterceptionPriority();
        await this.persistToCache(this.blocker);
      }
    }
    return this.blocker;
  }

  /**
   * Sets the request interception priority on the `PuppeteerBlocker` instance.
   */
  private setRequestInterceptionPriority(): void {
    this.blocker?.setRequestInterceptionPriority(this.opts.interceptResolutionPriority);
  }

  /**
   * Hook into this blocking event to make sure the cache is initialized before navigation.
   */
  public override async beforeLaunch(): Promise<void> {
    this.debug("beforeLaunch");
    await this.getBlocker();
  }

  /**
   * Hook into this blocking event to make sure the cache is initialized before navigation.
   */
  public override async beforeConnect(): Promise<void> {
    this.debug("beforeConnect");
    await this.getBlocker();
  }

  /**
   * Enable adblocking in `page`.
   */
  public override async onPageCreated(page: Page): Promise<void> {
    this.debug("onPageCreated");
    (await this.getBlocker()).enableBlockingInPage(page);
  }
}
