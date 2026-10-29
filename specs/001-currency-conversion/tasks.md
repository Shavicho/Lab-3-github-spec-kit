# Tasks: Conversor de monedas

**Input**: Design documents from `/specs/001-currency-conversion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Implementation conventions

Use the single source layout in [plan.md](./plan.md). The canonical conversion-result definition is [contracts/conversion-result.schema.json](./contracts/conversion-result.schema.json); implementation and tests must consume that contract rather than copying its field list or constraints into another schema.

## Phase 1: Setup

**Purpose**: Configure the static web application and its automated test tooling.

- [X] T001 Create `package.json` with `"type": "module"`, development dependencies `vite`, `vitest`, `jsdom`, `ajv`, and `@playwright/test`, and scripts `dev`, `build`, `preview`, `test`, `test:watch`, `test:e2e`, and `test:performance`
- [X] T002 Configure `vitest.config.js` with jsdom and test discovery for `tests/unit/**/*.test.js`, `tests/integration/**/*.test.js`, and `tests/contract/**/*.test.js`
- [X] T003 Configure `playwright.config.js` with Chromium, Firefox, and Edge (Microsoft Edge channel) projects for `tests/e2e/`, a Chromium-only project for `tests/performance/`, local `baseURL`, and Vite `webServer`

---

## Phase 2: Foundational

**Purpose**: Create the shared static app shell required by every user story.

- [X] T004 Create `index.html` with the accessible converter form shell, ES module entry point, and initially hidden loading, error, and result regions consumed by `src/ui/form.js`

**Checkpoint**: Test commands and shared document shell are available before story implementation.

---

## Phase 3: User Story 1 - Convertir una cantidad entre monedas (Priority: P1) 🎯 MVP

**Goal**: Convert an amount using a verified Frankfurter rate, display the conversion, or return an unchanged amount for identical currencies.

**Independent Test**: With a deterministic successful Frankfurter response, convert between two supported currencies and verify the displayed amount and rate; with equal currencies, verify the input amount is returned without a rate request. The produced result must conform to the canonical schema linked above. When the provider returns a date, display that date without inventing a time.

### Tests for User Story 1

- [X] T005 [P] [US1] Add AJV 2020 contract tests for valid and invalid result objects in `tests/contract/conversion-result.test.js`, loading `specs/001-currency-conversion/contracts/conversion-result.schema.json`
- [X] T006 [P] [US1] Add unit tests for rate multiplication, destination currency fraction digits, rounding, and same-currency identity conversion in `tests/unit/conversion.test.js`
- [X] T007 [P] [US1] Add deterministic mocked-fetch integration tests for supported currencies and a successful latest-rate response in `tests/integration/exchange-rate.test.js`
- [X] T008 [P] [US1] Add Playwright tests for valid conversion, same-currency conversion, currency swapping, date-only provider-date presentation, and a deferred rate response that asserts the loading indicator is visible until resolution in `tests/e2e/conversion-flow.spec.js`

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement Frankfurter `GET /currencies` and `GET /latest?from={fromCurrency}&to={toCurrency}` successful-response handling in `src/api/exchange-rate-client.js`
- [X] T010 [P] [US1] Implement rate-based calculation, destination-currency rounding, and no-request identity conversion in `src/utils/conversion.js`
- [X] T011 [US1] Implement the accessible amount field, currency selectors, submit action, swap action, and status regions in `src/ui/form.js`
- [X] T012 [US1] Coordinate submit, API lookup, conversion, and success rendering in `src/app/currency-converter.js`; produce data conforming to the canonical result contract without duplicating its schema
- [X] T013 [P] [US1] Implement responsive layout and visible loading, success, and error styles in `styles.css`

**Checkpoint**: US1 works independently with a valid provider response and satisfies the same-currency behavior.

---

## Phase 4: User Story 2 - Corregir una cantidad no válida (Priority: P2)

**Goal**: Reject invalid amounts before rate lookup and tell the user in Spanish how to correct them.

**Independent Test**: Empty, non-numeric, non-finite, negative, and multiple-separator inputs show a Spanish validation message and no result; one comma or period decimal separator is accepted.

### Tests for User Story 2

- [X] T014 [P] [US2] Add unit tests for empty, non-numeric, non-finite, negative, comma-decimal, period-decimal, and multiple-separator amounts in `tests/unit/validation.test.js`

### Implementation for User Story 2

- [X] T015 [US2] Implement amount parsing and validation in `src/utils/validation.js`, accepting one comma or one period as decimal separator and rejecting grouping separators, non-finite values, and negatives
- [X] T016 [US2] Connect validation errors to Spanish form feedback and clear prior results before handling a new submission in `src/app/currency-converter.js` and `src/ui/form.js`

**Checkpoint**: Invalid input never triggers a rate request or displays a conversion result.

---

## Phase 5: User Story 3 - Saber cuándo no se puede completar una conversión (Priority: P2)

**Goal**: Handle provider, network, unsupported-currency, and unusable-rate errors without displaying an unverified conversion.

**Independent Test**: Simulate network and HTTP failures, malformed JSON, unsupported currency, missing rate, and non-positive/non-finite rates; verify Spanish feedback and no visible result.

### Tests for User Story 3

- [X] T017 [P] [US3] Add mocked-fetch tests for network, HTTP, malformed JSON, unsupported currency, missing rate, and invalid rate cases in `tests/integration/exchange-rate.test.js`
- [X] T018 [P] [US3] Add Playwright failure-state tests in `tests/e2e/conversion-flow.spec.js` that assert Spanish feedback and a hidden result for failed provider requests in Chromium, Firefox, and Edge

### Implementation for User Story 3

- [X] T019 [US3] Map network, HTTP, JSON, base-currency, unsupported-currency, missing-rate, and invalid-rate failures to explicit domain errors in `src/api/exchange-rate-client.js`
- [X] T020 [US3] Render clear Spanish failure messages and keep the result hidden for every failed conversion in `src/app/currency-converter.js` and `src/ui/form.js`

**Checkpoint**: Failed requests and unusable rates cannot appear to users as successful conversions.

---

## Phase 6: Polish and Success-Criteria Verification

**Purpose**: Verify latency, usability, documentation, and the complete automated suite.

- [X] T021 [P] Implement a live-provider Playwright latency test in `tests/performance/conversion-latency.spec.js` that collects 20 successful sequential conversions, measures each duration from API-query initiation until the conversion result is visible on screen, records the environment and test conditions, and passes only if at least 19 of 20 durations are below 3000 ms
- [X] T022 Run `npm run test:performance` in stable network conditions without deliberate throttling or interruptions. Apply this criterion: En condiciones de red estables, realizar 20 conversiones exitosas; medir cada una desde el inicio de la consulta a la API hasta que el resultado de conversión se muestra en pantalla; al menos 19 de las 20 deben terminar en menos de 3000 ms. Registrar el entorno y las condiciones de la prueba. Record sample durations in `specs/001-currency-conversion/quickstart.md`; mark the run inconclusive if 20 successful conversions cannot be obtained
- [ ] T023 Conduct the CE-001 usability test with 10 first-time participants using the prompt “Convert 100 USD to EUR”; record anonymized completion count and times in `specs/001-currency-conversion/quickstart.md` and verify at least 9 finish within 60 seconds
- [X] T024 [P] Document purpose, prerequisites, and essential run/build/test commands in `README.md`
- [X] T025 Run `npm test`, `npm run test:e2e`, and `npm run build`; resolve failures in affected files and verify contract compliance and that failures never render a result

T023 remains pending because it requires a moderated study with 10 real first-time participants; no participant data or completion times were fabricated.

---

## Dependencies and Execution Order

### Phase dependencies

- Phase 1 has no prerequisites.
- Phase 2 requires Phase 1 and blocks all user-story implementation.
- User stories follow the specification's priority order: US1 (P1), then US2 and US3 (P2), which refine the shared conversion flow.
- Phase 6 follows the implementation of the conversion flow; the live performance check and user study require a runnable app.

### User story dependencies

- **US1 (P1)**: starts after Phase 2 and delivers the MVP.
- **US2 (P2)**: starts after US1 because it adds validation to the shared submission flow.
- **US3 (P2)**: starts after US1 because it extends the shared API and error-state handling; its mocked tests can be prepared independently of US2.
- Browser compatibility is verified by running the functional E2E suite in Chromium, Firefox, and Edge; performance sampling is intentionally Chromium-only.

### Parallel opportunities

- T002 and T003 can run in parallel after T001 because they configure separate test runners.
- T005–T008 can be authored in parallel in separate test files.
- T009 and T010 can be implemented in parallel in separate modules; T013 can proceed alongside them.
- T014 and T017 can be prepared in parallel after the US1 baseline, in separate test files.
- T021 and T024 can be implemented in parallel; the live measurement and user study follow implementation.

## Implementation Strategy

### MVP first

1. Complete setup and foundational app shell.
2. Complete US1 and its contract, unit, integration, and browser tests.
3. Validate US1 independently; stop for MVP review before proceeding to P2 stories.

### Incremental delivery

1. Add US2 input validation and its targeted tests.
2. Add US3 explicit provider/error handling and its targeted tests.
3. Complete CE-001 usability and CE-002/RNF-003 latency evaluation.
4. Run all automated tests and the production build; review against the constitution.
