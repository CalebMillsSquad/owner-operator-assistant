import type {
  BrokerContact,
  LoadOpportunity,
  MarketSignal,
  ShipperLead,
  SmartFuelStop,
} from "@prisma/client";

export type AcquisitionSummary = {
  openOpportunities: number;
  hotMarkets: number;
  activeBrokers: number;
  directShipperLeads: number;
  preferredFuelStops: number;
};

export function calculateOpportunityRatePerMile(rate: number | null | undefined, miles: number | null | undefined) {
  if (!rate || !miles || miles <= 0) {
    return null;
  }

  return rate / miles;
}

export function calculateFuelEstimatedCost(
  fuelPrice: number | null | undefined,
  gallonsPlanned: number | null | undefined,
) {
  if (!fuelPrice || !gallonsPlanned || gallonsPlanned <= 0) {
    return null;
  }

  return fuelPrice * gallonsPlanned;
}

export function isOpenOpportunity(opportunity: Pick<LoadOpportunity, "status">) {
  return !["BOOKED", "REJECTED", "EXPIRED"].includes(opportunity.status);
}

export function isHotMarket(signal: Pick<MarketSignal, "demandLevel">) {
  return signal.demandLevel === "HOT" || signal.demandLevel === "HIGH";
}

export function isActiveBroker(contact: Pick<BrokerContact, "relationshipStatus">) {
  return contact.relationshipStatus === "ACTIVE" || contact.relationshipStatus === "PREFERRED";
}

export function isDirectShipperLead(lead: Pick<ShipperLead, "status">) {
  return lead.status !== "LOST";
}

export function buildAcquisitionSummary({
  opportunities,
  marketSignals,
  brokerContacts,
  shipperLeads,
  fuelStops,
}: {
  opportunities: LoadOpportunity[];
  marketSignals: MarketSignal[];
  brokerContacts: BrokerContact[];
  shipperLeads: ShipperLead[];
  fuelStops: SmartFuelStop[];
}): AcquisitionSummary {
  return {
    openOpportunities: opportunities.filter(isOpenOpportunity).length,
    hotMarkets: marketSignals.filter(isHotMarket).length,
    activeBrokers: brokerContacts.filter(isActiveBroker).length,
    directShipperLeads: shipperLeads.filter(isDirectShipperLead).length,
    preferredFuelStops: fuelStops.filter((stop) => stop.preferred).length,
  };
}
