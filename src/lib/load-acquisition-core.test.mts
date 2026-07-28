import assert from "node:assert/strict";
import test from "node:test";

import type { BrokerContact, LoadOpportunity, MarketSignal, ShipperLead, SmartFuelStop } from "@prisma/client";

import {
  buildAcquisitionSummary,
  calculateFuelEstimatedCost,
  calculateOpportunityRatePerMile,
} from "./load-acquisition-core.ts";

const now = new Date("2026-06-22T12:00:00.000Z");

function loadOpportunity(status: LoadOpportunity["status"]): LoadOpportunity {
  return {
    id: `opportunity-${status}`,
    workspaceId: "local-workspace",
    sourceType: "BROKER",
    sourceName: null,
    brokerName: null,
    shipperName: null,
    contactName: null,
    phone: null,
    email: null,
    origin: "Memphis, TN",
    destination: "Dallas, TX",
    pickupDate: null,
    deliveryDate: null,
    equipmentType: null,
    rate: null,
    miles: null,
    ratePerMile: null,
    weight: null,
    commodity: null,
    status,
    priority: "MEDIUM",
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

function marketSignal(demandLevel: MarketSignal["demandLevel"]): MarketSignal {
  return {
    id: `market-${demandLevel}`,
    workspaceId: "local-workspace",
    marketName: `${demandLevel} lane`,
    originRegion: null,
    destinationRegion: null,
    equipmentType: null,
    demandLevel,
    sourceType: "BROKER",
    sourceName: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

function brokerContact(relationshipStatus: BrokerContact["relationshipStatus"]): BrokerContact {
  return {
    id: `broker-${relationshipStatus}`,
    workspaceId: "local-workspace",
    companyName: `${relationshipStatus} Broker`,
    contactName: null,
    phone: null,
    email: null,
    preferredLanes: null,
    equipmentNeeds: null,
    paymentNotes: null,
    relationshipStatus,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

function shipperLead(status: ShipperLead["status"]): ShipperLead {
  return {
    id: `shipper-${status}`,
    workspaceId: "local-workspace",
    companyName: `${status} Shipper`,
    industry: null,
    contactName: null,
    phone: null,
    email: null,
    location: null,
    recurringLanes: null,
    freightType: null,
    status,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

function smartFuelStop(preferred: boolean): SmartFuelStop {
  return {
    id: `fuel-${preferred}`,
    workspaceId: "local-workspace",
    truckStopName: preferred ? "Preferred Stop" : "Planned Stop",
    location: "Memphis, TN",
    state: "TN",
    fuelPrice: null,
    routeName: null,
    gallonsPlanned: null,
    estimatedCost: null,
    iftaNote: null,
    preferred,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

test("calculates opportunity rate per mile from rate and miles", () => {
  assert.equal(calculateOpportunityRatePerMile(2400, 452), 2400 / 452);
  assert.equal(calculateOpportunityRatePerMile(1800.5, 450.125), 1800.5 / 450.125);
});

test("returns null for rate per mile when rate or usable miles are missing", () => {
  assert.equal(calculateOpportunityRatePerMile(null, 452), null);
  assert.equal(calculateOpportunityRatePerMile(2400, null), null);
  assert.equal(calculateOpportunityRatePerMile(2400, 0), null);
  assert.equal(calculateOpportunityRatePerMile(2400, -10), null);
});

test("calculates fuel estimated cost from price and planned gallons", () => {
  assert.equal(calculateFuelEstimatedCost(3.749, 120), 3.749 * 120);
  assert.equal(calculateFuelEstimatedCost(4.125, 82.5), 4.125 * 82.5);
});

test("returns null for fuel estimated cost when price or usable gallons are missing", () => {
  assert.equal(calculateFuelEstimatedCost(null, 120), null);
  assert.equal(calculateFuelEstimatedCost(3.749, null), null);
  assert.equal(calculateFuelEstimatedCost(3.749, 0), null);
  assert.equal(calculateFuelEstimatedCost(3.749, -5), null);
});

test("builds dashboard summary counts from load acquisition records", () => {
  const summary = buildAcquisitionSummary({
    opportunities: [
      loadOpportunity("NEW"),
      loadOpportunity("REVIEWING"),
      loadOpportunity("CONTACTED"),
      loadOpportunity("NEGOTIATING"),
      loadOpportunity("BOOKED"),
      loadOpportunity("REJECTED"),
      loadOpportunity("EXPIRED"),
    ],
    marketSignals: [marketSignal("HOT"), marketSignal("HIGH"), marketSignal("MEDIUM"), marketSignal("LOW")],
    brokerContacts: [
      brokerContact("NEW"),
      brokerContact("ACTIVE"),
      brokerContact("PREFERRED"),
      brokerContact("WATCHLIST"),
      brokerContact("DO_NOT_USE"),
    ],
    shipperLeads: [
      shipperLead("LEAD"),
      shipperLead("CONTACTED"),
      shipperLead("QUALIFIED"),
      shipperLead("PROPOSAL_SENT"),
      shipperLead("ACTIVE"),
      shipperLead("LOST"),
    ],
    fuelStops: [smartFuelStop(true), smartFuelStop(false), smartFuelStop(true)],
  });

  assert.deepEqual(summary, {
    openOpportunities: 4,
    hotMarkets: 2,
    activeBrokers: 2,
    directShipperLeads: 5,
    preferredFuelStops: 2,
  });
});
