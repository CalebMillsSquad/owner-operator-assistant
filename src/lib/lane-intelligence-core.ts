import type { BrokerContact, Load, LoadOpportunity, MarketSignal, ShipperLead, SmartFuelStop } from "@prisma/client";

export type LaneSourceRecord =
  | { type: "load"; id: string; status: string; rate: number | null; miles: number | null; broker: string | null }
  | {
      type: "opportunity";
      id: string;
      status: string;
      priority: string;
      rate: number | null;
      miles: number | null;
      brokerName: string | null;
      shipperName: string | null;
    };

export type LaneIntelligenceSummary = {
  key: string;
  origin: string;
  destination: string;
  loadCount: number;
  opportunityCount: number;
  totalRecords: number;
  averageRatePerMile: number | null;
  latestActivity: Date | null;
  records: LaneSourceRecord[];
  brokers: BrokerContact[];
  shippers: ShipperLead[];
  marketSignals: MarketSignal[];
  fuelStops: SmartFuelStop[];
};

function cleanLanePart(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLanePart(value: string) {
  return cleanLanePart(value).toLocaleLowerCase("en-US");
}

export function buildLaneKey(origin: string, destination: string) {
  return `${normalizeLanePart(origin)}::${normalizeLanePart(destination)}`;
}

function laneTextMatches(value: string | null | undefined, lane: Pick<LaneIntelligenceSummary, "origin" | "destination">) {
  if (!value) {
    return false;
  }

  const haystack = value.toLocaleLowerCase("en-US");
  return haystack.includes(normalizeLanePart(lane.origin)) || haystack.includes(normalizeLanePart(lane.destination));
}

function marketSignalMatches(signal: MarketSignal, lane: Pick<LaneIntelligenceSummary, "origin" | "destination">) {
  return (
    laneTextMatches(signal.marketName, lane) ||
    laneTextMatches(signal.originRegion, lane) ||
    laneTextMatches(signal.destinationRegion, lane) ||
    laneTextMatches(signal.notes, lane)
  );
}

function fuelStopMatches(stop: SmartFuelStop, lane: Pick<LaneIntelligenceSummary, "origin" | "destination">) {
  return laneTextMatches(stop.routeName, lane) || laneTextMatches(stop.location, lane) || laneTextMatches(stop.notes, lane);
}

function calculateAverageRatePerMile(records: LaneSourceRecord[]) {
  const rates = records
    .map((record) => {
      if (!record.rate || !record.miles || record.miles <= 0) {
        return null;
      }

      return record.rate / record.miles;
    })
    .filter((rate): rate is number => rate !== null);

  if (rates.length === 0) {
    return null;
  }

  return rates.reduce((total, rate) => total + rate, 0) / rates.length;
}

function sortByUpdatedAt<T extends { updatedAt: Date }>(items: T[]) {
  return [...items].sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
}

export function buildLaneIntelligence({
  loads,
  opportunities,
  brokerContacts,
  shipperLeads,
  marketSignals,
  fuelStops,
}: {
  loads: Load[];
  opportunities: LoadOpportunity[];
  brokerContacts: BrokerContact[];
  shipperLeads: ShipperLead[];
  marketSignals: MarketSignal[];
  fuelStops: SmartFuelStop[];
}): LaneIntelligenceSummary[] {
  const laneMap = new Map<string, LaneIntelligenceSummary>();

  function getLane(origin: string, destination: string) {
    const cleanedOrigin = cleanLanePart(origin);
    const cleanedDestination = cleanLanePart(destination);
    const key = buildLaneKey(cleanedOrigin, cleanedDestination);
    const existing = laneMap.get(key);

    if (existing) {
      return existing;
    }

    const lane: LaneIntelligenceSummary = {
      key,
      origin: cleanedOrigin,
      destination: cleanedDestination,
      loadCount: 0,
      opportunityCount: 0,
      totalRecords: 0,
      averageRatePerMile: null,
      latestActivity: null,
      records: [],
      brokers: [],
      shippers: [],
      marketSignals: [],
      fuelStops: [],
    };

    laneMap.set(key, lane);
    return lane;
  }

  for (const load of loads) {
    const lane = getLane(load.origin, load.destination);
    lane.loadCount += 1;
    lane.totalRecords += 1;
    lane.latestActivity =
      lane.latestActivity && lane.latestActivity > load.updatedAt ? lane.latestActivity : load.updatedAt;
    lane.records.push({
      type: "load",
      id: load.id,
      status: load.status,
      rate: load.rate,
      miles: load.miles,
      broker: load.broker,
    });
  }

  for (const opportunity of opportunities) {
    const lane = getLane(opportunity.origin, opportunity.destination);
    lane.opportunityCount += 1;
    lane.totalRecords += 1;
    lane.latestActivity =
      lane.latestActivity && lane.latestActivity > opportunity.updatedAt ? lane.latestActivity : opportunity.updatedAt;
    lane.records.push({
      type: "opportunity",
      id: opportunity.id,
      status: opportunity.status,
      priority: opportunity.priority,
      rate: opportunity.rate,
      miles: opportunity.miles,
      brokerName: opportunity.brokerName,
      shipperName: opportunity.shipperName,
    });
  }

  const lanes = [...laneMap.values()];

  for (const lane of lanes) {
    lane.averageRatePerMile = calculateAverageRatePerMile(lane.records);
    lane.brokers = brokerContacts.filter((contact) => laneTextMatches(contact.preferredLanes, lane));
    lane.shippers = shipperLeads.filter((lead) => laneTextMatches(lead.recurringLanes, lane));
    lane.marketSignals = marketSignals.filter((signal) => marketSignalMatches(signal, lane));
    lane.fuelStops = fuelStops.filter((stop) => fuelStopMatches(stop, lane));
  }

  return lanes.sort((left, right) => {
    if (right.totalRecords !== left.totalRecords) {
      return right.totalRecords - left.totalRecords;
    }

    return (right.latestActivity?.getTime() ?? 0) - (left.latestActivity?.getTime() ?? 0);
  });
}

export function getRecentLaneRecords(records: LaneSourceRecord[], limit = 4) {
  return records.slice(0, limit);
}

export { sortByUpdatedAt };
