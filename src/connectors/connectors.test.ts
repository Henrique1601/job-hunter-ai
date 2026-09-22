import { describe, expect, it } from "vitest";

import { jobInputSchema } from "@/lib/validation";
import { GitHubHnConnector } from "./github-hn-connector";
import { GreenhouseConnector } from "./greenhouse-connector";
import { GupyConnector } from "./gupy-connector";
import { IndeedFeedConnector } from "./indeed-feed-connector";
import { LeverConnector } from "./lever-connector";
import { LinkedInFeedConnector } from "./linkedin-feed-connector";
import { LiveJobFeedConnector } from "./live-job-feed-connector";
import { getAllConnectors, getConnectorById } from "./registry";
import { RemoteTechFeedConnector } from "./remote-tech-feed-connector";

describe("Job Discovery Connectors & Registry", () => {
  it("registry retorna todos os 8 conectores ativos", () => {
    const connectors = getAllConnectors();
    expect(connectors).toHaveLength(8);

    const sourceIds = connectors.map((c) => c.sourceId);
    expect(sourceIds).toContain("remotive-api");
    expect(sourceIds).toContain("remote-tech-feed");
    expect(sourceIds).toContain("greenhouse");
    expect(sourceIds).toContain("lever");
    expect(sourceIds).toContain("gupy");
    expect(sourceIds).toContain("github-hn");
    expect(sourceIds).toContain("linkedin-feed");
    expect(sourceIds).toContain("indeed-feed");
  });

  it("getConnectorById busca conector específico com sucesso", () => {
    const gupy = getConnectorById("gupy");
    expect(gupy).toBeDefined();
    expect(gupy?.name).toContain("Gupy");

    const invalid = getConnectorById("non-existent");
    expect(invalid).toBeUndefined();
  });

  it("GreenhouseConnector descobre vagas com schema válido", async () => {
    const connector = new GreenhouseConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("greenhouse");
      expect(job.canonicalUrl).toMatch(/^https?:\/\//);
      expect(job.requiresHumanReview).toBe(true);
    }
  });

  it("LeverConnector descobre vagas com schema válido", async () => {
    const connector = new LeverConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("lever");
      expect(job.canonicalUrl).toMatch(/^https?:\/\//);
      expect(job.requiresHumanReview).toBe(true);
    }
  });

  it("GupyConnector descobre vagas com schema válido", async () => {
    const connector = new GupyConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("gupy");
      expect(job.canonicalUrl).toMatch(/^https?:\/\//);
      expect(job.requiresHumanReview).toBe(true);
    }
  });

  it("GitHubHnConnector descobre vagas da comunidade tech com schema válido", async () => {
    const connector = new GitHubHnConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("github-hn");
      expect(job.canonicalUrl).toMatch(/^https?:\/\//);
      expect(job.requiresHumanReview).toBe(true);
    }
  });

  it("LinkedInFeedConnector descobre vagas com schema válido", async () => {
    const connector = new LinkedInFeedConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("linkedin-feed");
      expect(job.canonicalUrl).toMatch(/^https?:\/\//);
      expect(job.requiresHumanReview).toBe(true);
    }
  });

  it("IndeedFeedConnector descobre vagas com schema válido", async () => {
    const connector = new IndeedFeedConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("indeed-feed");
      expect(job.canonicalUrl).toMatch(/^https?:\/\//);
      expect(job.requiresHumanReview).toBe(true);
    }
  });

  it("LiveJobFeedConnector descobre vagas com schema válido", async () => {
    const connector = new LiveJobFeedConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("remotive-api");
    }
  });

  it("RemoteTechFeedConnector descobre vagas com schema válido", async () => {
    const connector = new RemoteTechFeedConnector();
    const jobs = await connector.discover({ limit: 2 });

    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const parsed = jobInputSchema.safeParse(job);
      expect(parsed.success).toBe(true);
      expect(job.source).toBe("remote-tech-feed");
    }
  });
});
