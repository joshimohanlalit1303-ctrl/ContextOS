"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ContextOSClient: () => ContextOSClient
});
module.exports = __toCommonJS(index_exports);
var ContextOSClient = class {
  constructor(options) {
    if (!options.apiKey) {
      throw new Error("ContextOS: API Key is required.");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.contextos.dev";
  }
  async fetchAPI(endpoint, payload) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`ContextOS API Error: ${response.status} ${response.statusText} - ${JSON.stringify(err)}`);
    }
    return response.json();
  }
  /**
   * Ingest a new memory or conversation turn for a user.
   */
  async ingest(request) {
    return this.fetchAPI("/api/v1/ingest", request);
  }
  /**
   * Instantly fetch the structured user profile.
   */
  async getProfile(request) {
    return this.fetchAPI("/api/v1/get-profile", request);
  }
  /**
   * Fetch an LLM-optimized context pack including profile and recent activity.
   */
  async getContext(request) {
    return this.fetchAPI("/api/v1/get-context", request);
  }
  /**
   * Fetch the chronological evolution timeline of the user.
   */
  async getTimeline(request) {
    return this.fetchAPI("/api/v1/get-timeline", request);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ContextOSClient
});
