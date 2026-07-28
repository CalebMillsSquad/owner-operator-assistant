import assert from "node:assert/strict";
import test from "node:test";

import type { BrokerContact, Load, LoadOpportunity, MarketSignal, ShipperLead, SmartFuelStop } from "@prisma/client";

import { buildLaneIntelligence, buildLaneKey } from "./lane-intelligence-core.ts";

const now = new Date("2026-06-28T12:00:00.000Z");
const earlier = new Date("2026-06-27T12:00:00.000Z");

function load(overrides: Partial<Load> = {}): Load {
  return {
    id: "load-1",
    workspaceId: "local-workspace",
    loadNumber: "L-100",
    broker: "Blue Line Brokerage",
    origin: "Memphis, TN",
    destination: "Dallas, TX",
    miles: 452,
    loadedMiles: null,
    deadheadMiles: null,
    rate: 2400,
    ratePerMile: 2400 / 452,
    status: "DELIVERED",
    pickupDate: null,
    deliveryDate: null,
    commodity: null,
    weightPounds: null,
    notes: null,
    createdAt: earlier,
    updatedAt: earlier,
    ...overrides,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function opportunity(overrides: Partial<LoadOpportunity> = {}): LoadOpportunity {
  return {
    id: "opportunity-1",
    workspaceId: "local-workspace",
    sourceType: "BROKER",
    sourceName: null,
    brokerName: "Blue Line Brokerage",
    shipperName: null,
    contactName: null,
    phone: null,
    email: null,
    origin: " memphis, tn ",
    destination: "DALLAS, TX",
    pickupDate: null,
    deliveryDate: null,
    equipmentType: null,
    rate: 2600,
    miles: 452,
    ratePerMile: 2600 / 452,
    weight: null,
    commodity: null,
    status: "NEW",
    priority: "HIGH",
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function brokerContact(overrides: Partial<BrokerContact> = {}): BrokerContact {
  return {
    id: "broker-1",
    workspaceId: "local-workspace",
    companyName: "Blue Line Brokerage",
    contactName: null,
    phone: null,
    email: null,
    preferredLanes: "Memphis, TN to Dallas, TX weekly freight",
    equipmentNeeds: null,
    paymentNotes: null,
    relationshipStatus: "PREFERRED",
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function shipperLead(overrides: Partial<ShipperLead> = {}): ShipperLead {
  return {
    id: "shipper-1",
    workspaceId: "local-workspace",
    companyName: "River City Produce",
    industry: null,
    contactName: null,
    phone: null,
    email: null,
    location: "Memphis, TN",
    recurringLanes: "Memphis, TN outbound Dallas, TX backhaul",
    freightType: null,
    status: "QUALIFIED",
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function marketSignal(overrides: Partial<MarketSignal> = {}): MarketSignal {
  return {
    id: "market-1",
    workspaceId: "local-workspace",
    marketName: "Dallas dry van demand",
    originRegion: "Memphis, TN",
    destinationRegion: "Dallas, TX",
    equipmentType: null,
    demandLevel: "HOT",
    sourceType: "PERSONAL_OBSERVATION",
    sourceName: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    deletedAt: overrides.deletedAt ?? null,
  };
}

function fuelStop(overrides: Partial<SmartFuelStop> = {}): SmartFuelStop {
  return {
    id: "fuel-1",
    workspaceId: "local-workspace",
    truckStopName: "Trusted Fuel",
    location: "Dallas, TX",
    state: "TX",
    fuelPrice: 3.75,
    routeName: "Memphis, TN to Dallas, TX",
    gallonsPlanned: 120,
    estimatedCost: 450,
    iftaNote: null,
    preferred: true,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    deletedAt: overrides.deletedAt ?? null,
  };
}

test("builds stable lane keys from trimmed case-insensitive lane names", () => {
  assert.equal(buildLaneKey(" Memphis, TN ", "DALLAS, TX"), "memphis, tn::dallas, tx");
});

test("groups loads and opportunities by lane and calculates average rate per mile", () => {
  const lanes = buildLaneIntelligence({
    loads: [load()],
    opportunities: [opportunity()],
    brokerContacts: [],
    shipperLeads: [],
    marketSignals: [],
    fuelStops: [],
  });

  assert.equal(lanes.length, 1);
  assert.equal(lanes[0].origin, "Memphis, TN");
  assert.equal(lanes[0].destination, "Dallas, TX");
  assert.equal(lanes[0].loadCount, 1);
  assert.equal(lanes[0].opportunityCount, 1);
  assert.equal(lanes[0].totalRecords, 2);
  assert.equal(lanes[0].averageRatePerMile, (2400 / 452 + 2600 / 452) / 2);
  assert.equal(lanes[0].latestActivity?.toISOString(), now.toISOString());
});

test("matches related manual broker shipper market and fuel notes to a lane", () => {
  const lanes = buildLaneIntelligence({
    loads: [load()],
    opportunities: [],
    brokerContacts: [brokerContact(), brokerContact({ id: "broker-2", preferredLanes: "Atlanta to Chicago" })],
    shipperLeads: [shipperLead(), shipperLead({ id: "shipper-2", recurringLanes: "Phoenix to Denver" })],
    marketSignals: [marketSignal(), marketSignal({ id: "market-2", originRegion: "Atlanta, GA", destinationRegion: "Chicago, IL" })],
    fuelStops: [fuelStop(), fuelStop({ id: "fuel-2", routeName: "Phoenix to Denver", location: "Denver, CO" })],
  });

  assert.equal(lanes.length, 1);
  assert.deepEqual(
    {
      brokers: lanes[0].brokers.map((broker) => broker.id),
      shippers: lanes[0].shippers.map((shipper) => shipper.id),
      markets: lanes[0].marketSignals.map((signal) => signal.id),
      fuelStops: lanes[0].fuelStops.map((stop) => stop.id),
    },
    {
      brokers: ["broker-1"],
      shippers: ["shipper-1"],
      markets: ["market-1"],
      fuelStops: ["fuel-1"],
    },
  );
});
