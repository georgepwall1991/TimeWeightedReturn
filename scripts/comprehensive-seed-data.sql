-- Comprehensive Portfolio Analytics Seed Data
-- This script creates realistic sample data for demonstrating TWR calculations

USE PerformanceCalculationDb;
GO

-- Clear existing data (for development only)
DELETE FROM Holdings;
DELETE FROM Prices;
DELETE FROM FxRates;
DELETE FROM Instruments;
DELETE FROM Accounts;
DELETE FROM Portfolios;
DELETE FROM Clients;
DELETE FROM CashFlows;
GO

-- 1. Create Sample Clients
INSERT INTO Clients (Id, Name, CreatedAt, UpdatedAt) VALUES
(NEWID(), 'Smith Family Trust', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Johnson Pension Fund', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Williams Investment Partnership', GETUTCDATE(), GETUTCDATE());

-- Get client IDs for reference
DECLARE @SmithId UNIQUEIDENTIFIER = (SELECT Id FROM Clients WHERE Name = 'Smith Family Trust');
DECLARE @JohnsonId UNIQUEIDENTIFIER = (SELECT Id FROM Clients WHERE Name = 'Johnson Pension Fund');
DECLARE @WilliamsId UNIQUEIDENTIFIER = (SELECT Id FROM Clients WHERE Name = 'Williams Investment Partnership');

-- 2. Create Sample Portfolios
INSERT INTO Portfolios (Id, Name, ClientId, CreatedAt, UpdatedAt) VALUES
(NEWID(), 'Conservative Growth Portfolio', @SmithId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Aggressive Growth Portfolio', @SmithId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Balanced Retirement Fund', @JohnsonId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'High Yield Strategy', @WilliamsId, GETUTCDATE(), GETUTCDATE());

-- Get portfolio IDs
DECLARE @ConservativeId UNIQUEIDENTIFIER = (SELECT Id FROM Portfolios WHERE Name = 'Conservative Growth Portfolio');
DECLARE @AggressiveId UNIQUEIDENTIFIER = (SELECT Id FROM Portfolios WHERE Name = 'Aggressive Growth Portfolio');
DECLARE @BalancedId UNIQUEIDENTIFIER = (SELECT Id FROM Portfolios WHERE Name = 'Balanced Retirement Fund');
DECLARE @HighYieldId UNIQUEIDENTIFIER = (SELECT Id FROM Portfolios WHERE Name = 'High Yield Strategy');

-- 3. Create Sample Accounts
INSERT INTO Accounts (Id, Name, AccountNumber, Currency, PortfolioId, CreatedAt, UpdatedAt) VALUES
(NEWID(), 'ISA Account', 'ISA001', 'GBP', @ConservativeId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'General Investment Account', 'GIA001', 'GBP', @ConservativeId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'SIPP Account', 'SIPP001', 'GBP', @AggressiveId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Overseas Account', 'OVS001', 'USD', @AggressiveId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Pension Core', 'PEN001', 'GBP', @BalancedId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Pension Growth', 'PEN002', 'EUR', @BalancedId, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Trading Account', 'TRD001', 'GBP', @HighYieldId, GETUTCDATE(), GETUTCDATE());

-- Get account IDs
DECLARE @ISAId UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'ISA001');
DECLARE @GIAId UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'GIA001');
DECLARE @SIPPId UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'SIPP001');
DECLARE @OVSId UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'OVS001');
DECLARE @PEN001Id UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'PEN001');
DECLARE @PEN002Id UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'PEN002');
DECLARE @TRDId UNIQUEIDENTIFIER = (SELECT Id FROM Accounts WHERE AccountNumber = 'TRD001');

-- 4. Create Sample Instruments
INSERT INTO Instruments (Id, Ticker, Name, Type, Currency, CreatedAt, UpdatedAt) VALUES
-- Cash instruments
(NEWID(), 'GBP_CASH', 'British Pound Cash', 0, 'GBP', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'USD_CASH', 'US Dollar Cash', 0, 'USD', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'EUR_CASH', 'Euro Cash', 0, 'EUR', GETUTCDATE(), GETUTCDATE()),

-- UK Equities
(NEWID(), 'LLOY.L', 'Lloyds Banking Group', 1, 'GBP', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'VOD.L', 'Vodafone Group', 1, 'GBP', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'BP.L', 'BP plc', 1, 'GBP', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'TSCO.L', 'Tesco PLC', 1, 'GBP', GETUTCDATE(), GETUTCDATE()),

-- US Equities
(NEWID(), 'AAPL', 'Apple Inc', 1, 'USD', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'MSFT', 'Microsoft Corporation', 1, 'USD', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'GOOGL', 'Alphabet Inc', 1, 'USD', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'AMZN', 'Amazon.com Inc', 1, 'USD', GETUTCDATE(), GETUTCDATE()),

-- European Equities
(NEWID(), 'ASML.AS', 'ASML Holding NV', 1, 'EUR', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'SAP.DE', 'SAP SE', 1, 'EUR', GETUTCDATE(), GETUTCDATE()),

-- ETFs
(NEWID(), 'VUSA.L', 'Vanguard S&P 500 UCITS ETF', 1, 'GBP', GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'VWRL.L', 'Vanguard FTSE All-World UCITS ETF', 1, 'GBP', GETUTCDATE(), GETUTCDATE());

-- Get instrument IDs for holdings
DECLARE @GBPCashId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'GBP_CASH');
DECLARE @USDCashId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'USD_CASH');
DECLARE @EURCashId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'EUR_CASH');
DECLARE @LLOYId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'LLOY.L');
DECLARE @VODId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'VOD.L');
DECLARE @BPId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'BP.L');
DECLARE @TSCOId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'TSCO.L');
DECLARE @AAPLId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'AAPL');
DECLARE @MSFTId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'MSFT');
DECLARE @GOOGLId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'GOOGL');
DECLARE @AMZNId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'AMZN');
DECLARE @ASMLId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'ASML.AS');
DECLARE @SAPId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'SAP.DE');
DECLARE @VUSAId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'VUSA.L');
DECLARE @VWRLId UNIQUEIDENTIFIER = (SELECT Id FROM Instruments WHERE Ticker = 'VWRL.L');

-- 5. Create FX Rates (last 12 months)
DECLARE @StartDate DATE = DATEADD(YEAR, -1, GETDATE());
DECLARE @EndDate DATE = GETDATE();
DECLARE @CurrentDate DATE = @StartDate;

WHILE @CurrentDate <= @EndDate
BEGIN
    -- Skip weekends
    IF DATENAME(WEEKDAY, @CurrentDate) NOT IN ('Saturday', 'Sunday')
    BEGIN
        INSERT INTO FxRates (Id, BaseCurrency, QuoteCurrency, Date, Rate, CreatedAt) VALUES
        -- USD/GBP rates (simulate volatility around 1.25-1.30)
        (NEWID(), 'GBP', 'USD', @CurrentDate,
         1.25 + (RAND() * 0.05) + SIN(DATEDIFF(DAY, @StartDate, @CurrentDate) * 0.1) * 0.02,
         GETUTCDATE()),

        -- EUR/GBP rates (simulate volatility around 1.15-1.20)
        (NEWID(), 'GBP', 'EUR', @CurrentDate,
         1.17 + (RAND() * 0.03) + SIN(DATEDIFF(DAY, @StartDate, @CurrentDate) * 0.08) * 0.015,
         GETUTCDATE());
    END

    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END

-- 6. Create Prices (last 12 months)
SET @CurrentDate = @StartDate;

WHILE @CurrentDate <= @EndDate
BEGIN
    -- Skip weekends
    IF DATENAME(WEEKDAY, @CurrentDate) NOT IN ('Saturday', 'Sunday')
    BEGIN
        -- Calculate days from start for trend simulation
        DECLARE @DaysFromStart INT = DATEDIFF(DAY, @StartDate, @CurrentDate);

        INSERT INTO Prices (Id, InstrumentId, Date, Value, CreatedAt) VALUES
        -- Cash always 1.0
        (NEWID(), @GBPCashId, @CurrentDate, 1.0, GETUTCDATE()),
        (NEWID(), @USDCashId, @CurrentDate, 1.0, GETUTCDATE()),
        (NEWID(), @EURCashId, @CurrentDate, 1.0, GETUTCDATE()),

        -- UK Stocks (simulate realistic price movements)
        (NEWID(), @LLOYId, @CurrentDate,
         45.0 + (@DaysFromStart * 0.01) + (RAND() * 4 - 2) + SIN(@DaysFromStart * 0.05) * 3, GETUTCDATE()),
        (NEWID(), @VODId, @CurrentDate,
         75.0 + (@DaysFromStart * 0.005) + (RAND() * 6 - 3) + SIN(@DaysFromStart * 0.04) * 4, GETUTCDATE()),
        (NEWID(), @BPId, @CurrentDate,
         480.0 + (@DaysFromStart * 0.2) + (RAND() * 40 - 20) + SIN(@DaysFromStart * 0.03) * 25, GETUTCDATE()),
        (NEWID(), @TSCOId, @CurrentDate,
         285.0 + (@DaysFromStart * 0.15) + (RAND() * 20 - 10) + SIN(@DaysFromStart * 0.06) * 15, GETUTCDATE()),

        -- US Stocks (higher prices, more volatile)
        (NEWID(), @AAPLId, @CurrentDate,
         150.0 + (@DaysFromStart * 0.3) + (RAND() * 20 - 10) + SIN(@DaysFromStart * 0.02) * 15, GETUTCDATE()),
        (NEWID(), @MSFTId, @CurrentDate,
         350.0 + (@DaysFromStart * 0.5) + (RAND() * 30 - 15) + SIN(@DaysFromStart * 0.025) * 20, GETUTCDATE()),
        (NEWID(), @GOOGLId, @CurrentDate,
         2800.0 + (@DaysFromStart * 2.0) + (RAND() * 200 - 100) + SIN(@DaysFromStart * 0.015) * 150, GETUTCDATE()),
        (NEWID(), @AMZNId, @CurrentDate,
         3200.0 + (@DaysFromStart * 1.5) + (RAND() * 250 - 125) + SIN(@DaysFromStart * 0.018) * 180, GETUTCDATE()),

        -- European Stocks
        (NEWID(), @ASMLId, @CurrentDate,
         650.0 + (@DaysFromStart * 0.8) + (RAND() * 50 - 25) + SIN(@DaysFromStart * 0.022) * 35, GETUTCDATE()),
        (NEWID(), @SAPId, @CurrentDate,
         110.0 + (@DaysFromStart * 0.1) + (RAND() * 8 - 4) + SIN(@DaysFromStart * 0.04) * 6, GETUTCDATE()),

        -- ETFs (more stable growth)
        (NEWID(), @VUSAId, @CurrentDate,
         75.0 + (@DaysFromStart * 0.05) + (RAND() * 3 - 1.5) + SIN(@DaysFromStart * 0.03) * 2, GETUTCDATE()),
        (NEWID(), @VWRLId, @CurrentDate,
         95.0 + (@DaysFromStart * 0.08) + (RAND() * 4 - 2) + SIN(@DaysFromStart * 0.035) * 3, GETUTCDATE());
    END

    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END

-- 7. Create Holdings (current positions and some historical)
DECLARE @HoldingsDate DATE = GETDATE();

-- ISA Account Holdings
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @ISAId, @GBPCashId, @HoldingsDate, 5000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @LLOYId, @HoldingsDate, 2000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @VODId, @HoldingsDate, 1500.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @BPId, @HoldingsDate, 500.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @VUSAId, @HoldingsDate, 1000.0, GETUTCDATE(), GETUTCDATE());

-- GIA Account Holdings
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @GIAId, @GBPCashId, @HoldingsDate, 15000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @GIAId, @TSCOId, @HoldingsDate, 800.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @GIAId, @VWRLId, @HoldingsDate, 2000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @GIAId, @AAPLId, @HoldingsDate, 100.0, GETUTCDATE(), GETUTCDATE());

-- SIPP Account Holdings
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @SIPPId, @GBPCashId, @HoldingsDate, 8000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @SIPPId, @MSFTId, @HoldingsDate, 50.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @SIPPId, @GOOGLId, @HoldingsDate, 10.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @SIPPId, @VUSAId, @HoldingsDate, 1500.0, GETUTCDATE(), GETUTCDATE());

-- Overseas Account Holdings (USD)
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @OVSId, @USDCashId, @HoldingsDate, 25000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @OVSId, @AAPLId, @HoldingsDate, 200.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @OVSId, @AMZNId, @HoldingsDate, 15.0, GETUTCDATE(), GETUTCDATE());

-- Pension Core Holdings
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @PEN001Id, @GBPCashId, @HoldingsDate, 12000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @PEN001Id, @VWRLId, @HoldingsDate, 3000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @PEN001Id, @LLOYId, @HoldingsDate, 1000.0, GETUTCDATE(), GETUTCDATE());

-- Pension Growth Holdings (EUR)
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @PEN002Id, @EURCashId, @HoldingsDate, 18000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @PEN002Id, @ASMLId, @HoldingsDate, 50.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @PEN002Id, @SAPId, @HoldingsDate, 300.0, GETUTCDATE(), GETUTCDATE());

-- Trading Account Holdings
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @TRDId, @GBPCashId, @HoldingsDate, 20000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @TRDId, @BPId, @HoldingsDate, 1000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @TRDId, @TSCOId, @HoldingsDate, 1200.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @TRDId, @VUSAId, @HoldingsDate, 800.0, GETUTCDATE(), GETUTCDATE());

-- 8. Create some historical holdings for TWR calculations (3 months ago)
DECLARE @HistoricalDate DATE = DATEADD(MONTH, -3, GETDATE());

-- ISA Account Historical Holdings (slightly different positions)
INSERT INTO Holdings (Id, AccountId, InstrumentId, Date, Units, CreatedAt, UpdatedAt) VALUES
(NEWID(), @ISAId, @GBPCashId, @HistoricalDate, 8000.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @LLOYId, @HistoricalDate, 1800.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @VODId, @HistoricalDate, 1300.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @BPId, @HistoricalDate, 400.0, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @ISAId, @VUSAId, @HistoricalDate, 900.0, GETUTCDATE(), GETUTCDATE());

PRINT 'Comprehensive seed data created successfully!';
PRINT 'Created:';
PRINT '- 3 Clients with multiple portfolios';
PRINT '- 7 Accounts across different currencies';
PRINT '- 16 Instruments (Cash, UK/US/EU Equities, ETFs)';
PRINT '- 12 months of daily prices and FX rates';
PRINT '- Current and historical holdings for TWR calculations';
PRINT '';
PRINT 'You can now test:';
PRINT '- Portfolio tree navigation';
PRINT '- TWR calculations with real price movements';
PRINT '- Multi-currency support';
PRINT '- Holdings analysis';
