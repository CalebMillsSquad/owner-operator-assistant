# TRUSTed Dispatching Powered by Owner Operator Assistant OS

## Master Product Bible & Development Specification

**Recommended repository path:** `docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md`  
**Document purpose:** Master source of truth for product strategy, development direction, homepage positioning, feature scope, business logic, UI/UX direction, and Codex implementation guidance.  
**Status:** Living product specification  
**Last updated:** June 25, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Positioning](#2-product-positioning)
3. [Target Users](#3-target-users)
4. [Core Value Proposition](#4-core-value-proposition)
5. [MVP Scope](#5-mvp-scope)
6. [Future Scope](#6-future-scope)
7. [Feature Requirements](#7-feature-requirements)
8. [Smart Load Analysis Logic](#8-smart-load-analysis-logic)
9. [Smart Fuel Stops](#9-smart-fuel-stops)
10. [Recurring Lane / Contract Intelligence](#10-recurring-lane--contract-intelligence)
11. [Website Strategy](#11-website-strategy)
12. [Brand and UI Direction](#12-brand-and-ui-direction)
13. [App Architecture Rules](#13-app-architecture-rules)
14. [Data Model Strategy](#14-data-model-strategy)
15. [User Workflows](#15-user-workflows)
16. [Safety, Legal, Tax, and Compliance Guardrails](#16-safety-legal-tax-and-compliance-guardrails)
17. [Development Roadmap](#17-development-roadmap)
18. [Codex Operating Instructions](#18-codex-operating-instructions)
19. [Acceptance Criteria](#19-acceptance-criteria)
20. [Codex Prompt Library](#20-codex-prompt-library)
21. [Glossary](#21-glossary)

---

# 1. Executive Summary

TRUSTed Dispatching powered by Owner Operator Assistant OS is a premium dispatching and owner-operator business command center designed to help truck owner-operators manage the operational side of their business with better organization, visibility, and decision support.

The product is not intended to be a basic dispatching website or a simple load tracker. It is intended to become a practical business operating system for independent drivers and small trucking operations. The system should support dispatching workflows, load tracking, fuel and expense tracking, document storage, missing document alerts, tax-ready record organization, maintenance reminders, compliance reminders, route decision support, profitability visibility, recurring lane intelligence, and driver next-action guidance.

The central positioning is:

> **Premium dispatching plus business command center support for owner-operators.**

The product should help owner-operators answer critical business questions:

- What loads are active, upcoming, or delivered?
- What documents are missing, expired, or expiring soon?
- What fuel and operating expenses have been captured?
- What is the estimated profitability of a load, week, or month?
- Which route or load opportunity appears stronger based on rate, miles, fuel cost, deadhead, and operational risk?
- Which fuel stops, lanes, brokers, shippers, or regions appear to be worth tracking over time?
- What should the driver or dispatcher handle next?

TRUSTed Dispatching should feel like a premium business office for owner-operators. The software should help organize information and improve business visibility without making unsupported guarantees about taxes, legal compliance, DOT compliance, freight quality, or profitability.

The first version should be simple, functional, polished, and reviewable. It should prioritize static marketing clarity, a daily dashboard, core CRUD workflows, and decision-support calculations over expensive integrations or complex automation.

---

# 2. Product Positioning

## 2.1 Primary Positioning Statement

TRUSTed Dispatching is a premium dispatching and business command center service for owner-operators who want more than basic load booking.

It combines dispatch support with the Owner Operator Assistant OS: a business operations layer that helps drivers organize loads, documents, expenses, fuel records, reminders, and profitability visibility in one professional system.

## 2.2 What Makes It Different

Ordinary dispatching services often focus on finding and booking loads. TRUSTed Dispatching should position itself as broader and more valuable:

| Ordinary Dispatching | TRUSTed Dispatching + Owner Operator Assistant OS |
|---|---|
| Finds loads | Helps organize loads, routes, documents, expenses, and next actions |
| Focuses mainly on booking | Supports the business workflow around every load |
| Often reactive | Creates visibility before issues become urgent |
| May not track profitability | Provides load, weekly, and monthly profit visibility |
| May not track documents | Supports document vault organization and missing document alerts |
| May not analyze lanes | Builds manual lane intelligence over time |
| May not support business records | Helps organize tax-ready records for review with professionals |

## 2.3 Safe Positioning Language

Use these phrases consistently:

- Premium dispatching support
- Business command center for owner-operators
- Owner-operator business office support
- Load and route organization
- Smart load comparison
- Route decision support
- Profit visibility
- Tax-ready record organization
- Expense itemization support
- Documents organized for review
- Compliance reminders
- Maintenance reminders
- Driver next-action assistant
- Recurring lane intelligence
- Contract opportunity tracking

## 2.4 Claims to Avoid

Do not use language that implies guarantees or regulated professional services:

- Do not say the company prepares taxes.
- Do not guarantee DOT compliance.
- Do not provide legal advice.
- Do not guarantee higher profit.
- Do not guarantee the best loads.
- Do not claim the system audits every load in the market.
- Do not claim automated optimization unless the feature is actually built.
- Do not imply live fuel-price, weather, traffic, or load-board integrations unless they are explicitly approved and implemented.

## 2.5 Strategic Product Category

The product should sit between the following categories:

- Dispatch operations support
- Owner-operator business management
- Trucking profitability dashboard
- Document and compliance reminder system
- Freight relationship intelligence
- Driver workflow assistant

The long-term product category can be described as:

> **Owner-Operator Business Operating System**

---

# 3. Target Users

## 3.1 Owner-Operator

The primary user is an independent truck owner-operator responsible for both driving and running the business.

### Needs

- Book and organize loads.
- Understand whether loads are worth taking.
- Track fuel, expenses, and receipts.
- Keep documents organized.
- Remember important deadlines.
- See revenue, expenses, and estimated net.
- Reduce business chaos while on the road.

### Product Promise

The system gives the owner-operator a clear command center for the business side of trucking.

## 3.2 Dispatcher

The dispatcher uses the system to manage loads, route notes, broker communication, driver next actions, and recurring lane intelligence.

### Needs

- See load status quickly.
- Compare load opportunities.
- Track broker and shipper notes.
- Capture route and lane details.
- Surface missing documents or receipts.
- Help drivers make practical business decisions.

### Product Promise

The system helps dispatchers operate as business support partners, not just load bookers.

## 3.3 Small Fleet Operator

A small fleet operator may manage multiple drivers, trucks, and routes in the future.

### Needs

- Multi-truck visibility.
- Driver status tracking.
- Weekly and monthly summaries.
- Maintenance and document reminders.
- Load and expense organization by truck or driver.

### Product Promise

The future version can become a lightweight operations office for a small trucking business.

## 3.4 Independent Driver Seeking Business Support

Some drivers may not need full dispatching but may want help organizing the business side of trucking.

### Needs

- Expense itemization.
- Document tracking.
- Weekly summaries.
- Fuel and maintenance logs.
- Profit visibility.

### Product Promise

The platform supports better organization even when the driver books some or all loads independently.

## 3.5 Future Admin / Operator

A future internal admin may use the system to manage multiple clients, relationships, documents, and performance views.

### Needs

- Client list.
- Account-level records.
- Role-based access.
- Admin dashboard.
- Business reporting.

### Product Promise

The system can eventually support TRUSTed Dispatching as a scalable service operation.

---

# 4. Core Value Proposition

## 4.1 Primary Value Proposition

TRUSTed Dispatching helps owner-operators run a more organized trucking business by combining premium dispatching support with a command center for loads, routes, documents, expenses, fuel, maintenance, reminders, and profitability visibility.

## 4.2 Business Value

The product creates value by helping drivers and dispatchers:

- Reduce scattered information.
- Track key business records in one place.
- Compare loads using practical numbers.
- Build better awareness of fuel and operating costs.
- Identify missing documents or upcoming deadlines.
- Capture records that can be reviewed by tax professionals.
- See weekly and monthly performance more clearly.
- Track recurring lanes, brokers, and shippers.
- Turn dispatching into a more strategic business support service.

## 4.3 Emotional Value

Owner-operators often carry the pressure of driving, paperwork, compliance reminders, expenses, broker communication, maintenance, and profitability concerns at the same time.

The product should create a feeling of:

- Control
- Calm
- Organization
- Professionalism
- Visibility
- Trust
- Business confidence

## 4.4 Strategic Differentiator

The strongest differentiator is the combination of dispatching plus business operations support.

The product should make TRUSTed Dispatching look and feel like a professional trucking business office that helps drivers understand and organize the full operating picture around each load.

---

# 5. MVP Scope

The MVP should prove the product vision without over-engineering. It should focus on core workflows, static decision-support logic, and a polished user experience.

## 5.1 MVP Principles

The first version should be:

- Simple
- Functional
- Polished
- Reviewable
- Built around real owner-operator workflows
- Free from paid integrations
- Safe with private driver, financial, load, and document data

## 5.2 MVP Features

### 5.2.1 Homepage / Marketing Site

The homepage should clearly position TRUSTed Dispatching as premium dispatching plus business command center support.

It should communicate:

- Premium dispatching support
- Owner-operator business office support
- Load and route organization
- Document vault/storage
- Missing document alerts
- Tax-ready expense itemization
- Fuel and spending tracking
- Maintenance reminders
- Compliance reminders
- Weekly and monthly profit visibility
- Driver next-action assistant
- Smart load analysis
- Smart fuel stop notes
- Lane intelligence vision

### 5.2.2 Daily Driver Dashboard

The dashboard should show the most important operational information for the day:

- Active load
- Upcoming load
- Recent expenses
- Fuel summary
- Missing documents
- Maintenance reminders
- Weekly revenue
- Weekly expenses
- Estimated weekly net
- Next actions

### 5.2.3 Load Tracking

Core load fields:

- Load number
- Broker
- Origin
- Destination
- Loaded miles
- Deadhead miles
- Rate
- Pickup date/time
- Delivery date/time
- Status
- Commodity
- Weight
- Notes

### 5.2.4 Fuel and Expense Capture

The user should be able to capture:

- Expense category
- Amount
- Date
- Vendor
- Location
- State
- Load association when relevant
- Notes
- Receipt placeholder or future upload reference

### 5.2.5 Document Alerts

The MVP should track required or important records:

- CDL
- Medical card
- Insurance
- Registration
- Permits
- IFTA-related documents
- Load documents
- Bills of lading
- Maintenance records

Alert statuses:

- Current
- Expiring soon
- Expired
- Missing

### 5.2.6 Weekly Income and Expense Summary

The MVP should show:

- Weekly gross revenue
- Weekly expenses
- Estimated net
- Number of loads
- Average rate per mile
- Fuel spend
- Major expense categories

### 5.2.7 Manual Smart Fuel Stop Notes

The MVP should support manual fuel-stop intelligence:

- Preferred fuel stops
- Fuel vendor
- City/state
- Notes
- Typical price notes entered manually
- Parking notes
- Route notes
- Driver preference notes

### 5.2.8 Manual Smart Load Analysis

The MVP should support basic manual comparison between load opportunities using:

- Load rate
- Loaded miles
- Deadhead miles
- Estimated fuel cost
- Tolls
- Other expected costs
- Estimated net
- Rate per mile
- All-in rate per mile

### 5.2.9 Basic Profitability Visibility

The product should show profitability visibility using simple formulas and static calculations.

Do not present estimates as guaranteed profit.

### 5.2.10 Driver Next-Action List

The system should show practical next actions such as:

- Upload missing receipt
- Review active load details
- Add fuel purchase
- Review missing document
- Check upcoming maintenance
- Follow up on broker paperwork
- Review weekly summary

## 5.3 Out of Scope for MVP

Do not include in the first version unless explicitly approved:

- Paid APIs
- Live load-board integrations
- Automated broker outreach
- Real-time fuel-price integrations
- Automated tax filing
- DOT compliance certification
- Legal document generation
- Complex route optimization engines
- Multi-tenant admin architecture
- Multi-truck fleet management
- AI automation that changes records without user review

---

# 6. Future Scope

Future development should build on the MVP after the core workflows are stable.

## 6.1 Advanced Smart Fuel Stops

Future capabilities may include:

- Route-based fuel planning
- Fuel price comparison
- Preferred fuel network tracking
- Fuel stop performance history
- IFTA-aware fuel planning
- Maintenance-aware stop suggestions
- Driver preference scoring
- Fuel receipt automation if approved

## 6.2 Route Profitability Comparison

Future versions may compare multiple routes or load options using:

- Revenue
- Loaded miles
- Deadhead miles
- Fuel cost
- Tolls
- Time
- Maintenance exposure
- Pickup/delivery timing
- Region risk
- Backhaul potential
- Historical lane performance

## 6.3 IFTA Helper

Future IFTA support should remain an estimate and organization tool.

Potential features:

- Fuel purchased by state
- Miles driven by state
- Quarterly summary
- Exportable report
- Disclaimer requiring review by a qualified tax professional

## 6.4 Recurring Lane Intelligence

The system may help track:

- Frequent origin/destination pairs
- Repeat brokers
- Repeat shippers
- Repeat receivers
- Profitable lanes
- Weak lanes
- Seasonal patterns
- Backhaul opportunities
- Driver preferences by lane

## 6.5 Contract Opportunity Manager

The system may organize possible recurring freight relationships.

Potential records:

- Company name
- Contact person
- Origin region
- Destination region
- Freight type
- Frequency
- Notes
- Follow-up date
- Relationship status
- Estimated opportunity value

The product should organize opportunities. It should not guarantee contracts.

## 6.6 Broker / Shipper CRM

Future CRM capabilities:

- Broker profiles
- Shipper profiles
- Contact history
- Payment notes
- Lane notes
- Rate history
- Preference notes
- Follow-up reminders
- Relationship score based on manually entered observations

## 6.7 Maintenance-Aware Routing

Future decision support may consider:

- Current mileage
- Upcoming service due dates
- Service locations
- Tire/brake/oil needs
- Driver preference
- Risk notes

This should remain reminder and decision support, not safety certification.

## 6.8 Multi-Truck Support

Future small fleet support may include:

- Multiple trucks
- Multiple drivers
- Equipment assignments
- Load assignment
- Maintenance by truck
- Document alerts by truck
- Weekly summaries by driver or truck

## 6.9 PDF Exports

Future exports may include:

- Weekly revenue and expense summary
- Monthly business summary
- Load packet
- Expense report
- Fuel report
- Document checklist
- IFTA estimate summary

## 6.10 Notifications

Future notifications may include:

- Browser reminders
- Email reminders
- SMS reminders only if explicitly approved
- Maintenance due
- Document expiration
- Missing receipt
- Load follow-up

## 6.11 Approved Integrations Only

Any integration must be explicitly approved before implementation.

Potential future integrations:

- Fuel price services
- Mapping/routing services
- Load boards
- Accounting systems
- Email parsing
- Document OCR
- Cloud storage

No paid APIs should be added without approval.

---

# 7. Feature Requirements

This section defines the product requirements by module.

---

## 7.1 Dispatch Center

### Purpose

The Dispatch Center gives the dispatcher and owner-operator a clear view of active freight operations.

### MVP Requirements

The system should display:

- Active loads
- Upcoming pickups
- Upcoming deliveries
- Load statuses
- Broker names
- Origin/destination
- Rate
- Miles
- Notes
- Driver next actions

### Future Requirements

The system may support:

- Broker communication history
- Call notes
- Email notes
- Rate confirmation upload
- Load packet status
- Route timeline
- Driver check-ins
- Automated reminders

### UX Requirements

The dispatch center should feel like a command board:

- Clear load status badges
- Prominent active load card
- Quick action buttons
- Alerts for missing paperwork
- Summary cards for revenue, documents, and next actions

### Safety Requirements

Do not expose actual driver/load data publicly. All live load and financial data should be protected once authentication is implemented.

---

## 7.2 Load Tracking

### Purpose

Load tracking records operational and financial details for each load.

### MVP Fields

- Load number
- Broker
- Origin
- Destination
- Loaded miles
- Deadhead miles
- Rate
- Pickup date/time
- Delivery date/time
- Status
- Notes

### Recommended Statuses

- Booked
- In transit
- Delivered
- Cancelled

### Calculated Values

- Rate per mile
- All-in miles
- All-in rate per mile
- Estimated net
- Estimated net per mile

### Future Fields

- Shipper
- Receiver
- Commodity
- Weight
- Detention notes
- Lumper fees
- Toll estimates
- Route notes
- Delivery appointment notes
- Payment status
- Factoring status
- Document completion status

### Acceptance Criteria

- User can add and view loads.
- User can update load status.
- User can see rate and mileage information.
- User can associate expenses with a load when applicable.
- Calculations are labeled as estimates when appropriate.

---

## 7.3 Smart Load Analysis

### Purpose

Smart Load Analysis helps compare load opportunities before accepting them.

It should support decision-making, not guarantee outcomes.

### MVP Requirements

The user should be able to manually enter:

- Load rate
- Loaded miles
- Deadhead miles
- Estimated fuel price
- Truck MPG
- Estimated tolls
- Other estimated expenses
- Pickup timing notes
- Delivery timing notes
- Broker notes
- Lane notes

The system should calculate:

- Rate per mile
- All-in miles
- All-in rate per mile
- Estimated gallons needed
- Estimated fuel cost
- Estimated net
- Estimated net per mile

### Future Requirements

The system may include:

- Load comparison table
- Load score
- Lane history comparison
- Backhaul likelihood notes
- Preferred lane matching
- Broker history
- Seasonal notes
- Driver preference weighting

### Display Guidance

Use labels such as:

- “Estimated”
- “Decision support”
- “Compare before booking”
- “Review assumptions before accepting”

Avoid labels such as:

- “Guaranteed profit”
- “Best load”
- “Approved load”
- “Compliance verified”

---

## 7.4 Lane Intelligence

### Purpose

Lane Intelligence helps TRUSTed Dispatching learn from historical load activity and identify repeatable freight patterns.

### MVP Requirements

The MVP can start with manual records:

- Origin region
- Destination region
- Broker
- Shipper
- Receiver
- Average rate
- Average miles
- Average fuel cost
- Average estimated net
- Notes
- Driver preference
- Backhaul notes

### Future Requirements

Future versions may identify:

- Repeat lanes
- Strong lanes
- Weak lanes
- Frequent brokers
- Frequent shippers
- Backhaul opportunities
- Seasonal demand patterns
- Contract opportunity candidates

### Product Positioning

Lane Intelligence should be presented as a business memory system for dispatchers and owner-operators.

It helps answer:

- Which lanes have worked well before?
- Which regions have caused too much deadhead?
- Which brokers or shippers are worth developing?
- Which routes create better follow-up opportunities?

---

## 7.5 Smart Fuel Stops

### Purpose

Smart Fuel Stops helps drivers track fuel purchasing patterns, preferred stops, state-level fuel data, and route notes.

### MVP Requirements

Manual records:

- Fuel stop name
- Vendor
- City
- State
- Notes
- Preferred status
- Parking notes
- Shower/amenity notes if useful
- Typical route association
- Fuel purchase history

### Future Requirements

Potential advanced functionality:

- Route-based fuel suggestions
- Fuel price comparison
- IFTA-aware purchase planning
- Maintenance-aware fuel stop suggestions
- Fuel network preference tracking
- Approved API integrations only

### Acceptance Criteria

- MVP does not require paid fuel-price APIs.
- Fuel data can be entered manually.
- State tracking is supported for future IFTA reporting.
- Fuel planning is described as decision support.

---

## 7.6 Expense Management

### Purpose

Expense Management organizes business costs by category, date, vendor, location, state, and load association.

### MVP Categories

- Fuel
- Oil
- Tires
- Repairs
- Tolls
- Scales
- Permits
- Insurance
- Parking
- Food
- Other

### MVP Requirements

The user should be able to:

- Add an expense
- Select a category
- Enter amount
- Add vendor
- Add location
- Add state
- Add notes
- Associate the expense with a load when applicable

### Future Requirements

- Receipt upload
- Receipt preview
- PDF export
- Category trends
- Monthly breakdown
- Tax-ready summary

### Language Requirements

Use “tax-ready expense organization” or “records for review with a tax professional.”

Do not use “tax preparation” unless performed by licensed professionals and legally approved.

---

## 7.7 Fuel Tracking

### Purpose

Fuel Tracking records fuel purchases and supports profitability visibility, route planning, and future IFTA estimates.

### MVP Fields

- Fuel date
- Gallons
- Price per gallon
- Total cost
- Vendor
- Location
- State
- Odometer
- Truck ID or truck notes
- Load association if applicable
- Notes

### MVP Calculations

- Total fuel cost
- Average fuel price per gallon
- Fuel spend by week
- Fuel spend by month
- Fuel spend by state
- Fuel cost per mile where mileage is available

### Future Calculations

- Estimated MPG
- State-by-state IFTA estimate
- Fuel efficiency trend
- Fuel stop comparison

---

## 7.8 Profitability Center

### Purpose

The Profitability Center gives owner-operators visibility into business performance without guaranteeing outcomes.

### MVP Metrics

- Revenue per mile
- All-in rate per mile
- Gross load revenue
- Load expenses
- Estimated net per load
- Weekly revenue
- Weekly expenses
- Weekly estimated net
- Fuel spend
- Expense category breakdown

### Future Metrics

- Monthly performance
- Quarterly summary
- Year-to-date summary
- Lane profitability
- Broker profitability
- Shipper profitability
- Truck profitability
- Driver profitability

### Required Language

Use:

- Profit visibility
- Estimated net
- Business performance view
- Expense breakdown
- Revenue and cost tracking

Avoid:

- Guaranteed profit
- Profit optimization guarantee
- Financial advice

---

## 7.9 Document Vault

### Purpose

The Document Vault keeps important trucking and business records organized.

### MVP Document Types

- CDL
- Medical card
- Insurance
- Registration
- Permits
- IFTA records
- Bills of lading
- Rate confirmations
- Maintenance records
- Receipts

### MVP Requirements

The user should be able to track:

- Document title
- Document type
- Expiration date
- Status
- Notes
- File path or upload placeholder

### Status Logic

- Current: expires more than 60 days out
- Expiring soon: expires within 60 days
- Expired: expiration date is in the past
- Missing: required record is not available

### Future Requirements

- File uploads
- Search
- Filtering
- Document packet generation
- Expiration calendar
- Reminders

### Safety Requirements

Do not expose real documents in public routes.

---

## 7.10 Maintenance Center

### Purpose

The Maintenance Center helps track service items and upcoming maintenance needs.

### MVP Items

- Oil change
- Tires
- Brakes
- PM service
- DOT repair notes
- Annual inspection notes
- Other maintenance

### MVP Requirements

Track:

- Item title
- Due date
- Due mileage
- Last service date
- Last service mileage
- Current mileage
- Status
- Notes

### Statuses

- Upcoming
- Due soon
- Overdue
- Completed

### Future Requirements

- Maintenance cost tracking
- Service vendor tracking
- Maintenance history
- Maintenance-aware route planning
- Document attachment

### Safety Language

The product can provide reminders and organization. It should not certify vehicle safety or DOT compliance.

---

## 7.11 Compliance Reminder Center

### Purpose

The Compliance Reminder Center helps drivers stay aware of deadlines and records that may require attention.

### MVP Reminder Types

- CDL expiration
- Medical card expiration
- Insurance renewal
- Registration renewal
- Permit expiration
- Annual inspection
- Maintenance documentation
- Driver file reminders

### Required Language

Use:

- Compliance reminders
- Document tracking
- Deadline visibility
- Reminder workflow

Avoid:

- DOT-compliant guarantee
- Legal compliance certification
- Compliance audit completed

---

## 7.12 Driver Assistant / Next Actions

### Purpose

The Driver Assistant turns data into a simple list of practical next actions.

### MVP Next Actions

Examples:

- Add fuel purchase from today.
- Upload missing receipt.
- Review missing document.
- Check expiring insurance.
- Update load status.
- Review active load route notes.
- Add delivery confirmation.
- Review weekly summary.
- Check upcoming maintenance.

### MVP Logic

Next actions can be generated using simple rule-based logic:

- If document status is missing, show document action.
- If document expires within 60 days, show expiring soon action.
- If active load exists, show active load review action.
- If expense has no receipt path, show receipt action.
- If maintenance due date is close, show maintenance action.
- If weekly summary has uncategorized expenses, show expense review action.

### Future Logic

Future logic may include:

- Priority scoring
- Driver preference rules
- Recurring task templates
- Notifications
- AI-assisted summaries only if approved

---

## 7.13 Weekly and Monthly Summary

### Purpose

The summary module gives a clear view of revenue, expenses, fuel, and estimated net performance.

### MVP Weekly Summary

Show:

- Total load revenue
- Total expenses
- Fuel expenses
- Maintenance expenses
- Other expenses
- Estimated net
- Loads delivered
- Average rate per mile
- Missing documents or receipts

### Future Monthly Summary

Show:

- Monthly revenue
- Monthly expenses
- Monthly estimated net
- Expense categories
- Fuel by state
- Top lanes
- Top brokers
- Maintenance spend
- Document alerts

### Export Future

Future PDF exports may generate clean summaries for business review.

---

## 7.14 Broker / Shipper Relationship Tracking

### Purpose

Relationship tracking helps TRUSTed Dispatching build business intelligence around repeat freight partners.

### MVP Relationship Notes

The MVP can capture notes inside load records:

- Broker name
- Shipper name
- Receiver name
- Contact notes
- Payment notes
- Lane notes
- Service notes

### Future CRM Records

Future entities may include:

- Broker profile
- Shipper profile
- Receiver profile
- Contact person
- Phone/email
- Payment history
- Lane history
- Rate history
- Follow-up reminders
- Relationship status

### Positioning

This is not just contact storage. It is the beginning of a relationship-based freight strategy.

---

## 7.15 Future Contract Opportunity Manager

### Purpose

The Contract Opportunity Manager helps organize possible recurring freight relationships.

### Future Fields

- Opportunity name
- Company name
- Contact person
- Origin region
- Destination region
- Freight type
- Frequency
- Estimated volume
- Current relationship stage
- Follow-up date
- Notes
- Related lane
- Related broker or shipper

### Opportunity Stages

- Research
- Contacted
- Follow-up needed
- In discussion
- Active relationship
- Not a fit
- Paused

### Safe Language

Use:

- Contract opportunity tracking
- Recurring freight relationship tracking
- Follow-up organization
- Lane opportunity notes

Avoid:

- Guaranteed contracts
- Automated shipper acquisition
- Guaranteed freight

---

# 8. Smart Load Analysis Logic

Smart Load Analysis should help dispatchers and owner-operators compare loads using practical assumptions.

It is decision support, not a guarantee.

## 8.1 Core Inputs

The MVP should support the following input fields:

| Input | Description |
|---|---|
| Load rate | Total revenue offered for the load |
| Loaded miles | Miles from pickup to delivery |
| Deadhead miles | Miles required before pickup or after delivery when relevant |
| Truck MPG | Estimated miles per gallon |
| Fuel price per gallon | Manual estimate or actual known price |
| Tolls | Estimated toll cost |
| Other estimated expenses | Permits, parking, lumper fees, scale tickets, etc. |
| Pickup timing | Operational note |
| Delivery timing | Operational note |
| Broker/shipper notes | Relationship or risk note |
| Lane notes | Route, backhaul, or market note |

## 8.2 Core Formulas

```text
Rate per mile = load rate / loaded miles
```

```text
All-in miles = loaded miles + deadhead miles
```

```text
All-in rate per mile = load rate / all-in miles
```

```text
Estimated gallons needed = all-in miles / truck MPG
```

```text
Estimated fuel cost = estimated gallons needed × fuel price per gallon
```

```text
Estimated net = load rate - estimated fuel cost - tolls - other estimated expenses
```

```text
Estimated net per mile = estimated net / all-in miles
```

## 8.3 Example Calculation

Assumptions:

- Load rate: $2,400
- Loaded miles: 900
- Deadhead miles: 100
- Truck MPG: 6.5
- Fuel price per gallon: $4.00
- Tolls: $85
- Other estimated expenses: $50

Calculations:

```text
Rate per mile = 2400 / 900 = $2.67
```

```text
All-in miles = 900 + 100 = 1,000 miles
```

```text
All-in rate per mile = 2400 / 1000 = $2.40
```

```text
Estimated gallons needed = 1000 / 6.5 = 153.85 gallons
```

```text
Estimated fuel cost = 153.85 × 4.00 = $615.40
```

```text
Estimated net = 2400 - 615.40 - 85 - 50 = $1,649.60
```

```text
Estimated net per mile = 1649.60 / 1000 = $1.65
```

## 8.4 Optional Load Score Concept

A future version may include a decision-support score, but this should wait until the formulas and data capture are stable.

Potential factors:

- All-in rate per mile
- Estimated net per mile
- Deadhead percentage
- Broker relationship quality
- Shipper/receiver notes
- Backhaul opportunity
- Driver preference
- Delivery timing
- Maintenance impact

Suggested label:

> **Load Fit Score**

Avoid labels like “Best Load Score” because that implies a guarantee.

## 8.5 Decision-Support Disclaimer

Smart Load Analysis should include language such as:

> Smart Load Analysis provides estimates based on the information entered. Actual results may vary due to fuel prices, route changes, delays, maintenance, tolls, fees, and other operating conditions.

---

# 9. Smart Fuel Stops

Smart Fuel Stops should begin as a simple manual system and become more intelligent later.

---

## 9.1 MVP Smart Fuel Stops

The MVP should focus on records, notes, and repeatable driver knowledge.

### MVP Fields

- Fuel stop name
- Vendor
- City
- State
- Route or lane association
- Preferred stop flag
- Parking notes
- Safety notes
- Driver notes
- Last known price note entered manually
- Receipt placeholder
- Related fuel purchases

### MVP Use Cases

- Driver records a preferred fuel stop.
- Dispatcher notes which stops are useful on a lane.
- Driver logs fuel by state for future IFTA support.
- System shows fuel spend by week or month.
- System supports route notes without live API dependency.

### MVP UX

Smart Fuel Stops can appear as:

- A fuel stop list
- A card on the dashboard
- A fuel log detail page
- A lane detail note
- A next-action reminder when fuel records are missing

---

## 9.2 Future Smart Fuel Stops

Future capabilities may include:

- Route fuel planning
- Fuel price comparison
- Fuel discount network notes
- IFTA-aware planning
- Maintenance-aware stop suggestions
- Fuel efficiency trends
- Approved fuel-price integrations
- Approved mapping integrations

### Important Constraint

Do not add paid APIs, fuel-price APIs, or mapping integrations without explicit approval.

---

## 9.3 Smart Fuel Stop Positioning

Use language such as:

- Preferred fuel stop tracking
- Fuel purchase visibility
- Route-based fuel notes
- Fuel planning support
- Fuel records for business review
- Fuel records for future IFTA estimation

Avoid:

- Guaranteed cheapest fuel
- Automated IFTA compliance
- Guaranteed route optimization

---

# 10. Recurring Lane / Contract Intelligence

Recurring Lane and Contract Intelligence is a major strategic opportunity for TRUSTed Dispatching.

The strongest version of the business is not just finding one-off loads. It is learning which lanes, brokers, shippers, and repeat relationships can create more predictable opportunities for drivers.

---

## 10.1 Strategic Concept

The system should help TRUSTed Dispatching build a manual and eventually semi-intelligent memory of freight patterns.

Examples:

- A shipper regularly moves freight from Georgia to Texas.
- A receiver often has return freight nearby.
- A broker repeatedly posts similar freight on a specific lane.
- A driver frequently gets stuck with deadhead after delivering into a weak market.
- A region performs better during certain seasons.
- A lane has strong revenue but poor backhaul options.

The system should track these patterns so dispatchers can make better decisions over time.

---

## 10.2 MVP Lane Intelligence

Start manually. Do not overbuild.

### MVP Fields

- Origin city/state or region
- Destination city/state or region
- Broker
- Shipper
- Receiver
- Typical rate
- Typical miles
- Typical deadhead
- Typical fuel cost
- Estimated net range
- Backhaul notes
- Seasonal notes
- Driver preference
- Relationship notes
- Follow-up notes

### MVP Views

- Saved lanes list
- Lane detail page
- Lane notes inside load records
- Dashboard card for “lanes to watch”
- Simple recurring lane notes section

---

## 10.3 Future Contract Opportunity Tracking

Future opportunity records may include:

- Target company
- Freight type
- Origin
- Destination
- Frequency
- Contact person
- Current relationship status
- Follow-up date
- Notes
- Related lanes
- Related loads
- Estimated opportunity value

### Possible Opportunity Sources

- Repeat brokers
- Repeat shippers
- Repeat receivers
- Warehouses
- Distribution centers
- Manufacturers
- Agricultural producers
- Regional suppliers
- Customer referrals
- Dispatcher research

### Safe Framing

The platform helps organize and track opportunities. It does not guarantee contracts, guaranteed freight, or guaranteed revenue.

---

## 10.4 Backhaul Opportunity Tracking

Backhaul tracking should answer:

- After delivering into this region, where does the driver usually go next?
- Are there repeat loads returning toward the driver’s preferred region?
- Which brokers or shippers may help reduce deadhead?
- Which lanes should be avoided because the exit market is weak?

### MVP Backhaul Fields

- Delivery region
- Preferred next region
- Known brokers nearby
- Known shippers nearby
- Common freight types
- Notes
- Last successful backhaul

---

## 10.5 Lane Intelligence Acceptance Criteria

The product succeeds when it helps the dispatcher and driver:

- Remember which lanes have worked before.
- Track which relationships are worth developing.
- Understand deadhead risk more clearly.
- Record backhaul notes.
- Create follow-up tasks for possible recurring freight relationships.

---

# 11. Website Strategy

The website should make TRUSTed Dispatching feel premium, practical, and trustworthy.

It should not look like a generic dispatching landing page. It should look like the front door to a modern trucking business command center.

---

## 11.1 Homepage Structure

Recommended homepage sections:

1. Hero
2. Service Cards
3. Command Center Preview
4. More Than Dispatching
5. Document / Tax / Fuel / Maintenance Support
6. Smart Load Analysis
7. Smart Fuel Stops
8. Lane Intelligence
9. How It Works
10. CTA
11. Footer

---

## 11.2 Homepage Hero Copy

### Eyebrow

Premium Dispatching + Owner-Operator Command Center

### Headline

Premium Dispatching Plus a Business Command Center for Owner-Operators

### Subheadline

TRUSTed Dispatching helps owner-operators stay organized, track loads, monitor expenses, manage documents, and see the business side of every trip through the Owner Operator Assistant OS.

### Primary CTA

Request Dispatch Support

### Secondary CTA

Explore the Command Center

### Trust Line

Built for owner-operators who want dispatch support, business visibility, and organized records in one professional system.

---

## 11.3 Service Cards Copy

### Section Heading

Everything an Owner-Operator Needs to Stay Organized

### Section Subheading

TRUSTed Dispatching is built to support the business side of trucking — not just booking the next load.

### Card 1: Premium Dispatch Support

Load organization, route planning support, broker communication tracking, and dispatch workflow visibility.

### Card 2: Load & Route Organization

Keep booked, in-transit, and delivered loads organized with rate, mileage, route, and status visibility.

### Card 3: Document Vault & Alerts

Store important records and track missing or expiring documents before they create stress.

### Card 4: Tax-Ready Expense Itemization

Organize fuel, maintenance, repairs, tolls, permits, and operating expenses for review with your tax professional.

### Card 5: Fuel & Spending Tracking

Track fuel purchases, vendor spending, and operating costs so your numbers stay visible.

### Card 6: Maintenance & Compliance Reminders

Monitor service items, inspection needs, and document deadlines with simple reminder workflows.

### Card 7: Profit Visibility

See revenue, expenses, estimated net, and rate-per-mile visibility by load, week, and month.

### Card 8: Driver Next-Action Assistant

Surface practical next steps like missing receipts, upcoming maintenance, document alerts, and load follow-ups.

---

## 11.4 Command Center Preview Copy

### Section Heading

See the Business Side of Every Load

### Section Subheading

The Owner Operator Assistant OS gives dispatchers and drivers a clear view of the work that happens before, during, and after each load.

### Preview Cards

- Active Load
- Weekly Revenue
- Fuel Spend
- Missing Documents
- Maintenance Reminder
- Next Action
- Load Analysis
- Lane Notes

### Sample Static Preview Content

Use non-sensitive placeholder content only:

- Active Load: Dallas, TX → Atlanta, GA
- Status: In Transit
- Rate: $2,450
- All-In RPM: $2.18 estimated
- Fuel Spend: $612 this week
- Document Alert: Insurance renewal in 42 days
- Next Action: Upload delivery receipt after drop-off

---

## 11.5 More Than Dispatching Section Copy

### Heading

More Than Dispatching

### Subheading

Owner-operators do not just need loads. They need organized records, visible numbers, maintenance awareness, and a clear next step at the end of every day.

### Supporting Copy

TRUSTed Dispatching combines premium dispatch support with business operations visibility. The goal is to help owner-operators manage the paperwork, numbers, routes, reminders, and follow-ups that keep the business moving.

### Feature Blocks

#### Document Storage & Missing Record Alerts

Keep important files organized and surface missing or expiring records before they create stress.

#### Tax-Ready Expense Organization

Itemize fuel, repairs, tolls, permits, insurance, and operating costs so records are easier to review with a tax professional.

#### Fuel, Spending & Profit Visibility

Track what came in, what went out, and what each load may be contributing to weekly and monthly numbers.

#### Maintenance & Inspection Reminders

Stay aware of upcoming service needs, inspection tasks, and operating deadlines with simple reminder workflows.

#### Driver Next Actions

Give the driver a clear list of what needs attention next: receipts, documents, load updates, maintenance, or follow-up tasks.

### Disclaimer Line

TRUSTed Dispatching supports organization and visibility. Tax, legal, and compliance decisions should be reviewed with the appropriate licensed professional.

---

## 11.6 Smart Load Analysis Section Copy

### Heading

Compare Loads With Better Business Visibility

### Subheading

Smart Load Analysis helps review rate, miles, deadhead, estimated fuel cost, tolls, timing, and route notes before a decision is made.

### Bullets

- Compare rate per mile and all-in rate per mile.
- Estimate fuel cost using miles, MPG, and price per gallon.
- Review deadhead impact before accepting a load.
- Add broker, shipper, and lane notes for future reference.
- Keep the decision in the hands of the dispatcher and owner-operator.

### Safe Line

Load analysis provides decision support based on entered assumptions. It does not guarantee actual profit or load performance.

---

## 11.7 Smart Fuel Stops Section Copy

### Heading

Build Smarter Fuel Habits Over Time

### Subheading

Track fuel purchases, preferred stops, vendor notes, state records, and route-specific fuel insights without relying on expensive integrations.

### Bullets

- Save preferred fuel stops by lane.
- Track gallons, price, vendor, city, and state.
- Add parking, route, and driver notes.
- Support future IFTA estimate workflows.
- Keep fuel decisions visible in the business dashboard.

---

## 11.8 Lane Intelligence Section Copy

### Heading

Turn Repeat Routes Into Business Intelligence

### Subheading

TRUSTed Dispatching can help track recurring lanes, broker patterns, shipper relationships, backhaul notes, and future contract opportunities.

### Bullets

- Save lanes that perform well.
- Track weak lanes that create too much deadhead.
- Record broker and shipper patterns.
- Build notes around recurring freight opportunities.
- Organize follow-ups for potential long-term relationships.

### Safe Line

Lane Intelligence helps organize patterns and opportunities. It does not guarantee freight, contracts, or revenue.

---

## 11.9 How It Works Copy

### Heading

How TRUSTed Dispatching Supports the Business

### Step 1: Organize the Load

Capture the route, rate, broker, pickup, delivery, miles, and notes in one place.

### Step 2: Review the Numbers

Compare rate, miles, deadhead, fuel cost, and estimated net before and after the trip.

### Step 3: Track the Records

Keep documents, receipts, expenses, fuel purchases, and maintenance reminders organized.

### Step 4: Know the Next Action

See what needs attention next, from missing receipts to document alerts and broker follow-ups.

---

## 11.10 CTA Copy

### Heading

Ready to Run Dispatching Like a Business Command Center?

### Subheading

TRUSTed Dispatching helps owner-operators stay organized, see the numbers, and manage the business side of trucking with more clarity.

### Primary CTA

Request Dispatch Support

### Secondary CTA

View Command Center Vision

---

## 11.11 Footer Copy

TRUSTed Dispatching provides dispatch support, organization tools, and business visibility for owner-operators. Tax, legal, and compliance decisions should be reviewed with qualified professionals.

---

# 12. Brand and UI Direction

The interface should communicate premium service, business clarity, and trucking command center confidence.

---

## 12.1 Brand Personality

The brand should feel:

- Premium
- Trustworthy
- Organized
- Practical
- Business-focused
- Modern
- Calm
- Professional
- Strong without feeling aggressive

---

## 12.2 Visual Style

Use:

- Pearl white background
- Warm white surface cards
- Deep royal blue accents
- Subtle gold trim
- Rounded cards
- Raised panel styling
- Soft shadows
- Thin borders
- Clean dashboard previews
- Professional SaaS spacing

Avoid:

- Cheap neon colors
- Overly dark trucking clichés
- Cluttered dashboards
- Too many gradients
- Harsh yellow gold
- Unreadable low-contrast text
- Overdesigned animations

---

## 12.3 Suggested Tailwind Color Direction

Use existing Tailwind utilities where possible. Do not add custom CSS unless necessary.

Suggested utility approach:

- Page background: `bg-slate-50`, `bg-white`, or warm off-white combinations
- Primary text: `text-slate-950`
- Secondary text: `text-slate-600`
- Royal blue accents: `text-blue-900`, `bg-blue-900`, `border-blue-900`
- Softer blue panels: `bg-blue-50`, `border-blue-100`
- Gold accents: `text-amber-600`, `border-amber-300`, `bg-amber-50`
- Cards: `rounded-2xl`, `border`, `shadow-sm`, `ring-1`, `ring-slate-100`
- Premium panel: `bg-white/90`, `shadow-xl`, `border-slate-200`

---

## 12.4 Layout Direction

Homepage sections should use:

- Max-width containers
- Generous vertical spacing
- Clear headings
- Responsive card grids
- Dashboard preview panels
- Mobile-first spacing
- Strong CTA hierarchy

Recommended responsive grids:

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 or 4 columns depending on content

---

## 12.5 Dashboard Preview Direction

The homepage should include a static command center preview using placeholder data.

Possible dashboard preview modules:

- Active Load card
- Route card
- Weekly revenue card
- Fuel spend card
- Missing document alert
- Maintenance reminder
- Next action panel
- Load analysis mini-card
- Lane intelligence mini-card

No real driver, load, financial, or document data should appear on public marketing pages.

---

# 13. App Architecture Rules

This project should remain simple and aligned with the existing technical direction.

---

## 13.1 Required Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Prisma
- SQLite for local development
- PostgreSQL later
- Node.js 24

---

## 13.2 Routing Rules

Use Next.js App Router only.

Do not use Pages Router patterns.

Recommended current and future route categories:

- `/` public homepage or current dashboard depending on repo state
- `/dashboard` future protected driver dashboard if homepage is public
- `/loads`
- `/expenses`
- `/receipts`
- `/profitability`
- `/maintenance`
- `/inspections`
- `/documents`
- `/summary`
- `/assistant`
- `/fuel` future route if separated from expenses
- `/lanes` future route
- `/relationships` future route
- `/opportunities` future route

Before changing route structure, Codex must inspect the current implementation.

---

## 13.3 Component Rules

- Server Components by default.
- Add `"use client"` only for real interactivity.
- Prefer small reusable components when they improve clarity.
- Do not create premature abstractions.
- Use existing `src/components/ui` primitives where available.
- Use existing `src/components/dashboard` layout components where appropriate.

---

## 13.4 Data Access Rules

- Use the Prisma singleton from `src/lib/prisma.ts`.
- Do not create a new `PrismaClient` inline.
- Do not expose private data in public routes.
- Use Server Actions for simple form mutations.
- Do not create API routes unless necessary.
- Keep financial and document data protected.

---

## 13.5 Styling Rules

- Use Tailwind utility classes.
- Avoid custom CSS unless absolutely necessary.
- Keep the design premium, clean, and responsive.
- Use semantic HTML where possible.
- Maintain accessible contrast.

---

## 13.6 Security and Privacy Rules

Never commit:

- Secrets
- API keys
- Private driver data
- Real load data
- Real financial data
- Real documents
- Real receipts

Use `.env.local` for local secrets.

Do not expose uploads publicly without access control in future versions.

---

## 13.7 Integration Rules

No paid APIs or external services should be added unless explicitly approved.

This includes:

- Mapping APIs
- Fuel-price APIs
- Load-board APIs
- OCR APIs
- SMS APIs
- Email APIs
- Cloud storage APIs
- Accounting APIs

---

# 14. Data Model Strategy

This section is conceptual. It should guide future database design but should not force immediate schema changes.

Codex should not modify `prisma/schema.prisma` unless the prompt explicitly asks for schema work.

---

## 14.1 MVP Data Models

### Load

Represents a booked or potential load.

Important fields:

- id
- loadNumber
- broker
- origin
- destination
- miles
- deadheadMiles
- rate
- ratePerMile
- status
- pickupDate
- deliveryDate
- commodity
- weight
- notes
- createdAt
- updatedAt

### Expense

Represents a business expense.

Important fields:

- id
- loadId
- category
- amount
- expenseDate
- vendor
- location
- state
- notes
- receiptPath
- createdAt
- updatedAt

### FuelLog

Represents a fuel purchase.

Important fields:

- id
- fuelDate
- gallons
- pricePerGallon
- totalCost
- vendor
- location
- state
- odometer
- truckId
- loadId
- notes
- createdAt
- updatedAt

### MaintenanceItem

Represents maintenance tracking.

Important fields:

- id
- title
- dueMileage
- dueDate
- lastServiceDate
- lastServiceMileage
- currentMileage
- status
- notes
- createdAt
- updatedAt

### DocumentAlert

Represents a required or important document.

Important fields:

- id
- title
- documentType
- expiresDate
- status
- notes
- filePath
- createdAt
- updatedAt

### InspectionChecklist

Represents pre-trip, post-trip, or roadside inspection notes.

Important fields:

- id
- inspectionDate
- type
- odometer
- itemsJson
- overallPassed
- notes
- createdAt

---

## 14.2 Future Data Models

### Broker

Represents broker relationship intelligence.

Possible fields:

- id
- name
- contactName
- phone
- email
- paymentNotes
- relationshipNotes
- preferredStatus
- createdAt
- updatedAt

### Shipper

Represents shipper relationship intelligence.

Possible fields:

- id
- name
- contactName
- phone
- email
- originRegion
- freightTypes
- relationshipNotes
- createdAt
- updatedAt

### Lane

Represents a recurring or saved route pattern.

Possible fields:

- id
- originCity
- originState
- destinationCity
- destinationState
- averageRate
- averageMiles
- averageDeadhead
- averageEstimatedNet
- preferredStatus
- backhaulNotes
- seasonalNotes
- createdAt
- updatedAt

### FuelStop

Represents a preferred or tracked fuel location.

Possible fields:

- id
- name
- vendor
- city
- state
- preferred
- parkingNotes
- routeNotes
- lastKnownPriceNote
- createdAt
- updatedAt

### LoadAnalysis

Represents a comparison or decision-support calculation for a load.

Possible fields:

- id
- loadId
- loadRate
- loadedMiles
- deadheadMiles
- allInMiles
- truckMpg
- fuelPricePerGallon
- estimatedFuelCost
- tolls
- otherEstimatedExpenses
- estimatedNet
- estimatedNetPerMile
- notes
- createdAt
- updatedAt

### DriverNextAction

Represents a task surfaced to the driver or dispatcher.

Possible fields:

- id
- title
- description
- priority
- status
- relatedEntityType
- relatedEntityId
- dueDate
- createdAt
- updatedAt

### ContractOpportunity

Represents a possible recurring freight relationship.

Possible fields:

- id
- companyName
- contactName
- contactInfo
- originRegion
- destinationRegion
- freightType
- frequency
- stage
- followUpDate
- notes
- relatedLaneId
- createdAt
- updatedAt

---

## 14.3 Model Implementation Guidance

Use phased schema changes:

1. Only add models when the UI/workflow needs them.
2. Keep MVP models simple.
3. Avoid premature multi-tenant complexity.
4. Add indexes later when data volume requires them.
5. Keep relationships clear and reviewable.
6. Preserve migration history.
7. Use enums for stable statuses.
8. Use plain text notes for early flexibility.

---

# 15. User Workflows

---

## 15.1 Booking a Load

### User Goal

Capture a booked load and make it visible in the command center.

### Steps

1. User opens Loads.
2. User selects Add Load.
3. User enters broker, origin, destination, rate, miles, pickup date, delivery date, and notes.
4. System calculates rate per mile when enough data is available.
5. Load appears in active or upcoming dashboard sections.
6. Driver Next Actions may show route review or document reminders.

### Acceptance Criteria

- Load can be saved.
- Load status is visible.
- Rate and mileage are displayed clearly.
- No real data is exposed publicly.

---

## 15.2 Comparing a Load

### User Goal

Estimate whether a load appears financially and operationally reasonable.

### Steps

1. User opens Smart Load Analysis.
2. User enters load rate, loaded miles, deadhead miles, truck MPG, fuel price, tolls, and other costs.
3. System calculates all-in miles, all-in rate per mile, estimated fuel cost, estimated net, and estimated net per mile.
4. User reviews route notes, broker notes, and lane notes.
5. User decides whether to pursue the load.

### Acceptance Criteria

- Calculations are shown accurately.
- Estimates are labeled clearly.
- The tool does not claim to guarantee profit.

---

## 15.3 Tracking Fuel

### User Goal

Record fuel purchases for cost tracking and future IFTA support.

### Steps

1. User opens Fuel or Expenses.
2. User enters date, gallons, price per gallon, vendor, location, state, and notes.
3. System calculates total fuel cost if needed.
4. Fuel spend appears in weekly summary.
5. Fuel state data is available for future reporting.

### Acceptance Criteria

- Fuel purchase can be saved.
- Fuel cost is visible in summaries.
- State tracking is captured.

---

## 15.4 Uploading Receipts

### User Goal

Attach receipts to expenses for organized records.

### MVP / Future Note

Receipt upload may begin as a placeholder and then become local file storage.

### Steps

1. User opens an expense.
2. User selects upload receipt.
3. User attaches a file.
4. System stores the receipt path.
5. Expense shows receipt status.

### Acceptance Criteria

- Upload path is safe.
- File is not exposed publicly without access control.
- Receipt status is visible.

---

## 15.5 Reviewing Missing Documents

### User Goal

See which records are missing, expired, or expiring soon.

### Steps

1. User opens Documents.
2. System lists documents by status.
3. User reviews missing or expiring records.
4. User updates notes or uploads a document in future version.
5. Driver Next Actions updates accordingly.

### Acceptance Criteria

- Documents are categorized by status.
- Expiration logic is clear.
- Reminder language does not guarantee compliance.

---

## 15.6 Checking Weekly Profit Visibility

### User Goal

Review weekly revenue, expenses, and estimated net.

### Steps

1. User opens Summary or Dashboard.
2. System totals load revenue for the week.
3. System totals expenses for the week.
4. System shows estimated net.
5. System shows fuel spend and major expense categories.

### Acceptance Criteria

- Weekly revenue is visible.
- Weekly expenses are visible.
- Estimated net is calculated.
- The UI uses “estimated” and “visibility” language.

---

## 15.7 Creating a Maintenance Reminder

### User Goal

Track upcoming or overdue maintenance.

### Steps

1. User opens Maintenance.
2. User creates a maintenance item.
3. User enters due date or due mileage.
4. System displays status.
5. Driver Next Actions may show upcoming or overdue maintenance.

### Acceptance Criteria

- Maintenance item can be saved.
- Due status is visible.
- The system does not certify vehicle safety or compliance.

---

## 15.8 Reviewing Next Actions

### User Goal

Know what needs attention today.

### Steps

1. User opens Dashboard or Assistant.
2. System displays rule-based next actions.
3. User reviews tasks by priority.
4. User clicks into related records where available.
5. User completes or updates records.

### Acceptance Criteria

- Next actions are clear.
- Actions are practical and related to records.
- The system does not make changes without user review.

---

## 15.9 Tracking Recurring Lanes

### User Goal

Build intelligence around repeat freight patterns.

### Steps

1. User records a load with origin and destination.
2. User adds broker, shipper, and lane notes.
3. User marks the lane as worth tracking if relevant.
4. System stores the lane note.
5. Future loads can reference the lane history.

### Acceptance Criteria

- Lane notes can be recorded.
- Repeat lane opportunities can be reviewed.
- The system does not claim to guarantee recurring freight.

---

# 16. Safety, Legal, Tax, and Compliance Guardrails

This product handles sensitive trucking business information. Guardrails are mandatory.

---

## 16.1 Tax Language

Use:

- Tax-ready records
- Expense itemization support
- Records organized for review with a tax professional
- Fuel and expense summaries
- Business record organization

Avoid:

- We prepare taxes
- Tax filing included
- Guaranteed tax savings
- IRS-compliant guarantee
- Tax advice

Suggested disclaimer:

> TRUSTed Dispatching helps organize records and expense information. Tax decisions and filings should be reviewed with a qualified tax professional.

---

## 16.2 Legal Language

Use:

- Business organization support
- Document tracking
- Reminder workflows

Avoid:

- Legal advice
- Legal document guarantee
- Legal compliance guarantee

Suggested disclaimer:

> TRUSTed Dispatching does not provide legal advice. Legal questions should be reviewed with a qualified professional.

---

## 16.3 DOT / Compliance Language

Use:

- Compliance reminders
- Document expiration tracking
- Inspection checklist support
- Reminder visibility

Avoid:

- DOT compliance guaranteed
- Compliance certified
- DOT audit passed
- Legal compliance verified

Suggested disclaimer:

> Compliance reminders are provided for organization and visibility. DOT and regulatory requirements should be reviewed with qualified compliance professionals or appropriate authorities.

---

## 16.4 Profit Language

Use:

- Profit visibility
- Estimated net
- Route comparison
- Load comparison
- Business performance visibility
- Decision support

Avoid:

- Guaranteed higher profit
- Best loads guaranteed
- Profit optimization guarantee
- We guarantee better rates

Suggested disclaimer:

> Profitability views are estimates based on entered data. Actual results may vary due to fuel prices, delays, maintenance, tolls, fees, and market conditions.

---

## 16.5 Data Privacy Rules

Do not expose publicly:

- Real driver names
- Real load data
- Real broker communication
- Real financial records
- Real receipts
- Real documents
- Real tax records
- Real compliance records

Marketing pages must use static placeholder data only.

---

# 17. Development Roadmap

---

## Phase 1: Marketing Homepage and MVP Dashboard

### Goals

- Establish premium website positioning.
- Build a simple daily driver dashboard.
- Implement core load, expense, document, and weekly summary workflows.

### Features

- Homepage hero
- Service cards
- Command center preview
- More Than Dispatching section
- Daily dashboard
- Load tracking
- Fuel and expense capture
- Document alerts
- Weekly summary
- Basic next actions

### Success Criteria

- The product is clearly positioned as premium dispatching plus business command center support.
- The dashboard helps owner-operators see daily priorities.
- Core records can be captured and reviewed.

---

## Phase 2: Profitability and Document Support

### Goals

- Strengthen business visibility.
- Improve document and receipt organization.

### Features

- Receipt upload
- Profitability calculator
- Load-level estimated net
- Weekly and monthly summaries
- Document vault improvements
- Maintenance reminders
- DOT inspection checklist support

### Success Criteria

- Drivers can see estimated performance by load and week.
- Documents and receipts are easier to manage.
- Maintenance and inspection reminders are visible.

---

## Phase 3: Smart Load / Fuel / Lane Intelligence

### Goals

- Add practical decision-support intelligence without paid integrations.

### Features

- Smart Load Analysis
- Manual load comparison
- Smart Fuel Stop records
- Preferred fuel stops
- Saved lanes
- Lane notes
- Backhaul notes
- Basic recurring lane tracking

### Success Criteria

- Dispatchers can compare load opportunities.
- Drivers can track fuel-stop knowledge.
- The system starts building lane memory.

---

## Phase 4: CRM and Contract Opportunity Tracking

### Goals

- Build relationship intelligence around brokers, shippers, and recurring opportunities.

### Features

- Broker profiles
- Shipper profiles
- Receiver profiles
- Relationship notes
- Payment notes
- Follow-up reminders
- Contract Opportunity Manager
- Recurring lane opportunity dashboard

### Success Criteria

- TRUSTed Dispatching can track relationship history.
- Potential recurring freight opportunities are organized.
- Follow-up workflows are visible.

---

## Phase 5: Advanced Integrations Only If Approved

### Goals

- Add integrations only when they are necessary and approved.

### Potential Features

- Mapping/routing integration
- Fuel-price integration
- Load-board integration
- OCR receipt extraction
- PDF generation
- Email notifications
- Browser notifications
- Multi-truck support
- Admin/client management

### Success Criteria

- Integrations solve proven workflow problems.
- No paid service is added without approval.
- Data security remains strong.

---

# 18. Codex Operating Instructions

Codex should use this document as a product and development guide.

---

## 18.1 Required First Steps for Every Codex Session

Before editing code, Codex should:

1. Inspect the repository structure.
2. Read `README.md`.
3. Read `AGENTS.md`.
4. Read the `docs` folder if present.
5. Read this Product Bible.
6. Inspect `package.json`.
7. Inspect relevant files under `src/app`.
8. Inspect relevant components under `src/components`.
9. Identify the current implementation before making changes.
10. State the intended files to modify.

---

## 18.2 Engineering Guardrails

Codex must not:

- Modify unrelated files.
- Modify database schema unless explicitly asked.
- Modify authentication or access-control logic unless explicitly asked.
- Modify dashboard business logic while working on marketing copy.
- Add paid APIs.
- Add external integrations.
- Add secrets.
- Expose real driver, load, document, or financial data.
- Rewrite the app architecture unnecessarily.
- Convert the project to Pages Router.
- Create a monorepo.

---

## 18.3 Preferred Implementation Style

Codex should:

- Use Next.js App Router patterns.
- Use TypeScript.
- Use Tailwind CSS v4 utilities.
- Use Server Components by default.
- Use Server Actions for simple mutations.
- Use the existing Prisma singleton.
- Keep changes small and reviewable.
- Prefer simple static content for marketing pages.
- Use placeholder data only for public dashboard previews.
- Provide a clear implementation summary.

---

## 18.4 Pull Request Discipline

One task should equal one focused PR.

Preferred commit types:

- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for maintenance
- `docs:` for documentation
- `style:` for visual-only changes
- `refactor:` for structure changes without behavior change

---

## 18.5 Codex Completion Summary

At the end of each task, Codex should summarize:

- Files changed
- What was implemented
- What was intentionally not changed
- Any assumptions made
- Any follow-up recommendations
- How to test locally

---

# 19. Acceptance Criteria

---

## 19.1 Overall Product Success Criteria

The product is successful when:

- TRUSTed Dispatching is clearly positioned as premium dispatching plus business command center support.
- Owner-operators can track loads, fuel, expenses, documents, maintenance, and weekly performance.
- The system helps drivers and dispatchers understand next actions.
- Business records are easier to organize.
- Profitability visibility is clear but not overstated.
- Smart Load Analysis supports better comparison without promising outcomes.
- Smart Fuel Stops begin as manual operational intelligence.
- Lane Intelligence helps track recurring patterns and opportunities over time.

---

## 19.2 Homepage Acceptance Criteria

The homepage should:

- Communicate premium dispatching support.
- Communicate business command center support.
- Include service/value cards.
- Include a command center preview.
- Include More Than Dispatching messaging.
- Include document, expense, fuel, maintenance, compliance reminder, profit visibility, smart load analysis, smart fuel stops, and lane intelligence messaging.
- Use safe language around taxes, compliance, legal matters, and profit.
- Use placeholder data only.
- Use pearl white, royal blue, and subtle gold styling.
- Feel premium, clean, and professional.
- Be responsive on mobile, tablet, and desktop.

---

## 19.3 Dashboard Acceptance Criteria

The dashboard should:

- Show active and upcoming loads.
- Show recent expenses.
- Show fuel spend visibility.
- Show document alerts.
- Show maintenance reminders.
- Show weekly revenue, expenses, and estimated net.
- Show next actions.
- Avoid clutter.
- Protect private data when auth is implemented.

---

## 19.4 MVP Acceptance Criteria

The MVP is complete when:

- Homepage positioning is clear.
- Core dashboard exists.
- Loads can be tracked.
- Fuel and expenses can be captured.
- Document alerts can be tracked.
- Weekly summary is visible.
- Basic manual load analysis exists or is represented clearly in the roadmap.
- Smart fuel stops exist or are represented clearly in the roadmap.
- Next actions exist as a simple rule-based list or static first version.
- The app runs locally without TypeScript errors.
- No secrets or private data are exposed.

---

## 19.5 Smart Load Analysis Acceptance Criteria

Smart Load Analysis succeeds when:

- User can enter core load assumptions.
- System calculates rate per mile.
- System calculates all-in miles.
- System calculates all-in rate per mile.
- System estimates fuel cost.
- System estimates net.
- System estimates net per mile.
- UI labels values as estimates.
- No profit guarantee is implied.

---

## 19.6 Smart Fuel Stops Acceptance Criteria

Smart Fuel Stops succeeds when:

- User can record preferred fuel stops.
- User can add vendor, city, state, and notes.
- User can track fuel purchases.
- State data is captured for future IFTA support.
- No live fuel-price API is required.
- No cheapest-fuel guarantee is implied.

---

## 19.7 Lane Intelligence Acceptance Criteria

Lane Intelligence succeeds when:

- User can save lane notes.
- User can identify repeat origin/destination patterns.
- User can record backhaul notes.
- User can associate lanes with brokers or shippers in future versions.
- User can track possible recurring freight opportunities.
- No contract guarantee is implied.

---

# 20. Codex Prompt Library

This section provides reusable prompts for future Codex sessions.

---

## 20.1 Add Product Bible to Repo

```text
Act as a senior Next.js engineer and repository maintainer.

Goal:
Add the Owner Operator Assistant OS Product Bible to the repository as documentation.

Steps:
1. Inspect the repository structure.
2. Review README.md and AGENTS.md.
3. Check whether a docs folder exists.
4. If docs does not exist, create it.
5. Add this document as docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md.
6. Do not modify app code.
7. Do not modify database schema.
8. Do not modify package.json unless absolutely necessary, which should not be necessary.

Acceptance criteria:
- Product Bible exists at docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md.
- Markdown is clean and readable.
- No app behavior changes.
- No schema changes.
- No paid APIs or integrations added.
```

---

## 20.2 Homepage Positioning Update

```text
Act as a senior product-minded Next.js engineer and UI/UX implementer.

Goal:
Update the homepage to position TRUSTed Dispatching as premium dispatching plus business command center support for owner-operators.

Before editing:
1. Read README.md.
2. Read AGENTS.md.
3. Read docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md.
4. Inspect src/app/page.tsx.
5. Inspect src/app/layout.tsx.
6. Inspect src/components/ui and src/components/dashboard.
7. Determine whether the root page is currently marketing, dashboard, or mixed.

Implementation:
- Update homepage copy and layout only.
- Use Next.js App Router + TypeScript.
- Use Tailwind CSS v4 utilities.
- Use Server Components by default.
- Use static placeholder data only.
- Do not expose private driver/load/financial/document data.
- Do not add paid APIs.
- Do not modify Prisma schema.
- Do not modify unrelated routes.

Required sections:
- Hero
- Service cards
- Command center preview
- More Than Dispatching
- Smart Load Analysis
- Smart Fuel Stops
- Lane Intelligence
- How It Works
- CTA
- Footer

Acceptance criteria:
- Homepage clearly communicates premium dispatching plus business command center support.
- Design uses pearl white, royal blue, subtle gold, rounded cards, and premium command center styling.
- Copy avoids tax, legal, compliance, load, and profit guarantees.
- Page is responsive.
- No unrelated app behavior changes.
```

---

## 20.3 Add Smart Load Analysis MVP

```text
Act as a senior Next.js App Router engineer and trucking profitability product architect.

Goal:
Add an MVP Smart Load Analysis feature using manual inputs and simple decision-support calculations.

Before editing:
1. Read README.md.
2. Read AGENTS.md.
3. Read docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md.
4. Inspect existing routes under src/app.
5. Inspect existing Prisma schema.
6. Do not modify schema unless this prompt explicitly authorizes it.

MVP requirements:
- Create or update a route for Smart Load Analysis if appropriate.
- Support manual input fields for:
  - load rate
  - loaded miles
  - deadhead miles
  - truck MPG
  - fuel price per gallon
  - tolls
  - other estimated expenses
- Calculate:
  - rate per mile
  - all-in miles
  - all-in rate per mile
  - estimated gallons needed
  - estimated fuel cost
  - estimated net
  - estimated net per mile
- Label all outputs as estimates.
- Include disclaimer that results are decision support only.

Technical requirements:
- Use Next.js App Router.
- Use TypeScript.
- Use Tailwind CSS v4.
- Use Server Components unless interactivity requires a Client Component.
- Keep implementation simple and reviewable.
- No paid APIs.
- No external integrations.

Acceptance criteria:
- Calculations are correct.
- UI is responsive.
- No profit guarantee language appears.
- No unrelated files are modified.
```

---

## 20.4 Add Smart Fuel Stops MVP

```text
Act as a senior Next.js engineer and freight operations product designer.

Goal:
Add an MVP Smart Fuel Stops feature based on manual records and preferred fuel stop notes.

Before editing:
1. Read README.md.
2. Read AGENTS.md.
3. Read docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md.
4. Inspect current expenses and fuel-related routes.
5. Inspect Prisma schema.
6. Do not modify schema unless explicitly required by this task.

MVP requirements:
- Support manual preferred fuel stop records or a static first version if schema is not ready.
- Fields should include:
  - fuel stop name
  - vendor
  - city
  - state
  - preferred status
  - route/lane notes
  - parking notes
  - driver notes
- Show fuel stop cards or a simple table.
- Explain that fuel stop intelligence starts manually.
- Do not add fuel-price APIs.
- Do not imply cheapest fuel guarantees.

Acceptance criteria:
- Feature is simple and usable.
- Design matches premium command center style.
- No paid APIs or integrations are added.
- No unrelated routes are modified.
```

---

## 20.5 Add Lane Intelligence MVP

```text
Act as a freight-tech product architect and senior Next.js engineer.

Goal:
Add an MVP Lane Intelligence concept to the app or documentation, depending on current project readiness.

Before editing:
1. Read README.md.
2. Read AGENTS.md.
3. Read docs/OWNER_OPERATOR_ASSISTANT_OS_PRODUCT_BIBLE.md.
4. Inspect the current routes and data models.
5. Decide whether this should be implemented as documentation, static marketing content, or an app route.
6. Do not modify database schema unless explicitly asked.

MVP concept:
Lane Intelligence starts as manual tracking of recurring lanes, broker patterns, shipper patterns, backhaul notes, and potential recurring freight opportunities.

Possible fields:
- origin region
- destination region
- broker
- shipper
- receiver
- typical rate
- typical miles
- typical deadhead
- backhaul notes
- seasonal notes
- relationship notes
- follow-up notes

Acceptance criteria:
- Feature is positioned as manual business intelligence.
- No guarantee of contracts, freight, or profit appears.
- No paid integrations are added.
- Changes are focused and reviewable.
```

---

# 21. Glossary

## All-In Miles

Loaded miles plus deadhead miles.

## All-In Rate Per Mile

Load rate divided by all-in miles.

## Backhaul

A load that helps move a driver back toward a preferred region after delivery.

## Business Command Center

The central dashboard where dispatch, load, expense, fuel, document, maintenance, profitability, and next-action information is organized.

## Compliance Reminder

A reminder related to documents, deadlines, inspection records, or operational tasks. It does not guarantee legal or DOT compliance.

## Contract Opportunity

A possible recurring freight relationship to track and follow up on. It is not a guaranteed contract.

## Deadhead Miles

Miles driven without a paying load.

## Driver Next Action

A suggested task based on current records, such as uploading a receipt, checking a document, reviewing maintenance, or updating a load.

## IFTA Helper

A future estimate and organization tool for fuel and mileage by state. It should be reviewed with a qualified tax professional.

## Lane Intelligence

A system for tracking repeat route patterns, broker/shipper relationships, backhaul notes, and lane profitability history.

## Load Fit Score

A possible future decision-support score based on rate, miles, fuel, deadhead, timing, lane history, and driver preferences.

## Profit Visibility

A clear view of revenue, expenses, and estimated net results. It is not a guarantee of profit.

## Smart Fuel Stops

Manual and future intelligent tracking of fuel stop preferences, fuel purchases, state records, and route notes.

## Smart Load Analysis

Manual and future intelligent comparison of load opportunities using rates, miles, deadhead, fuel estimates, tolls, expenses, and route notes.

---

# Final Product Principle

TRUSTed Dispatching should always be built as more than a dispatching service.

It should become the professional business command center that helps owner-operators stay organized, understand the numbers, track the records, manage the reminders, and build smarter freight relationships over time.

The first version should be simple. The long-term vision should be powerful.

Every feature should support one clear promise:

> **Help owner-operators run the business side of trucking with more organization, visibility, and confidence.**
