import { GitHubHnConnector } from "./github-hn-connector";
import { GreenhouseConnector } from "./greenhouse-connector";
import { GupyConnector } from "./gupy-connector";
import { IndeedFeedConnector } from "./indeed-feed-connector";
import { LeverConnector } from "./lever-connector";
import { LinkedInFeedConnector } from "./linkedin-feed-connector";
import { LiveJobFeedConnector } from "./live-job-feed-connector";
import { RemoteTechFeedConnector } from "./remote-tech-feed-connector";
import type { JobDiscoveryConnector } from "./types";

/**
 * Retorna instâncias de todos os conectores de vagas registrados no sistema.
 */
export function getAllConnectors(): JobDiscoveryConnector[] {
  return [
    new LiveJobFeedConnector(),
    new RemoteTechFeedConnector(),
    new GreenhouseConnector(),
    new LeverConnector(),
    new GupyConnector(),
    new GitHubHnConnector(),
    new LinkedInFeedConnector(),
    new IndeedFeedConnector(),
  ];
}

/**
 * Busca um conector específico pelo seu identificador único de origem (`sourceId`).
 */
export function getConnectorById(sourceId: string): JobDiscoveryConnector | undefined {
  const connectors = getAllConnectors();
  return connectors.find((c) => c.sourceId === sourceId);
}

/**
 * Retorna os nomes e identificadores de todos os conectores ativos.
 */
export function getRegisteredConnectorSummary(): Array<{
  sourceId: string;
  name: string;
}> {
  return getAllConnectors().map((c) => ({
    sourceId: c.sourceId,
    name: c.name,
  }));
}
