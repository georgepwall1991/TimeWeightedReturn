using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddABorIBorWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CashFlows_AccountId",
                table: "CashFlows");

            migrationBuilder.RenameIndex(
                name: "IX_Prices_InstrumentId_Date",
                table: "Prices",
                newName: "IX_Price_Instrument_Date");

            migrationBuilder.RenameIndex(
                name: "IX_Holdings_AccountId_InstrumentId_Date",
                table: "Holdings",
                newName: "IX_Holding_Account_Instrument_Date");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Prices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Prices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Prices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                table: "Prices",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BatchId",
                table: "Prices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BookOfRecord",
                table: "Prices",
                type: "integer",
                nullable: false,
                defaultValue: 2); // ABoR = 2

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Prices",
                type: "integer",
                nullable: false,
                defaultValue: 3); // Approved = 3

            migrationBuilder.AddColumn<string>(
                name: "SubmittedBy",
                table: "Prices",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Holdings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Holdings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Holdings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                table: "Holdings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BatchId",
                table: "Holdings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BookOfRecord",
                table: "Holdings",
                type: "integer",
                nullable: false,
                defaultValue: 2); // ABoR = 2

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Holdings",
                type: "integer",
                nullable: false,
                defaultValue: 3); // Approved = 3

            migrationBuilder.AddColumn<string>(
                name: "SubmittedBy",
                table: "Holdings",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "CashFlows",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "TransactionReference",
                table: "CashFlows",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "CashFlows",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "CashFlows",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "CashFlows",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                table: "CashFlows",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BatchId",
                table: "CashFlows",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BookOfRecord",
                table: "CashFlows",
                type: "integer",
                nullable: false,
                defaultValue: 2); // ABoR = 2

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "CashFlows",
                type: "integer",
                nullable: false,
                defaultValue: 3); // Approved = 3

            migrationBuilder.AddColumn<string>(
                name: "SubmittedBy",
                table: "CashFlows",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PerformedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    Changes = table.Column<string>(type: "text", nullable: true),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Metadata = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReconciliationBatches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BatchDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Source = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    SourceFileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ItemCount = table.Column<int>(type: "integer", nullable: false),
                    MatchedCount = table.Column<int>(type: "integer", nullable: false),
                    BreakCount = table.Column<int>(type: "integer", nullable: false),
                    SubmittedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Comments = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReconciliationBatches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReconciliationBreaks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    BreakType = table.Column<int>(type: "integer", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IBorEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    ABorEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: true),
                    InstrumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    BreakDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ExpectedValue = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActualValue = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Variance = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ResolvedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionAction = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Comments = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReconciliationBreaks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReconciliationBreaks_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ReconciliationBreaks_Instruments_InstrumentId",
                        column: x => x.InstrumentId,
                        principalTable: "Instruments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ReconciliationBreaks_ReconciliationBatches_BatchId",
                        column: x => x.BatchId,
                        principalTable: "ReconciliationBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Price_BatchId",
                table: "Prices",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Price_BookOfRecord_Status",
                table: "Prices",
                columns: new[] { "BookOfRecord", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Holding_BatchId",
                table: "Holdings",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Holding_BookOfRecord_Status",
                table: "Holdings",
                columns: new[] { "BookOfRecord", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CashFlow_Account_Category_Date",
                table: "CashFlows",
                columns: new[] { "AccountId", "Category", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_CashFlow_Account_Date",
                table: "CashFlows",
                columns: new[] { "AccountId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_CashFlow_BatchId",
                table: "CashFlows",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_CashFlow_BookOfRecord_Status",
                table: "CashFlows",
                columns: new[] { "BookOfRecord", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CashFlow_Type",
                table: "CashFlows",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_PerformedAt",
                table: "AuditLogs",
                column: "PerformedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_PerformedBy",
                table: "AuditLogs",
                column: "PerformedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBatches_BatchDate",
                table: "ReconciliationBatches",
                column: "BatchDate");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBatches_Status",
                table: "ReconciliationBatches",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBreaks_AccountId",
                table: "ReconciliationBreaks",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBreaks_BatchId",
                table: "ReconciliationBreaks",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBreaks_BreakType",
                table: "ReconciliationBreaks",
                column: "BreakType");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBreaks_InstrumentId",
                table: "ReconciliationBreaks",
                column: "InstrumentId");

            migrationBuilder.CreateIndex(
                name: "IX_ReconciliationBreaks_Status",
                table: "ReconciliationBreaks",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_CashFlows_ReconciliationBatches_BatchId",
                table: "CashFlows",
                column: "BatchId",
                principalTable: "ReconciliationBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Holdings_ReconciliationBatches_BatchId",
                table: "Holdings",
                column: "BatchId",
                principalTable: "ReconciliationBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Prices_ReconciliationBatches_BatchId",
                table: "Prices",
                column: "BatchId",
                principalTable: "ReconciliationBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CashFlows_ReconciliationBatches_BatchId",
                table: "CashFlows");

            migrationBuilder.DropForeignKey(
                name: "FK_Holdings_ReconciliationBatches_BatchId",
                table: "Holdings");

            migrationBuilder.DropForeignKey(
                name: "FK_Prices_ReconciliationBatches_BatchId",
                table: "Prices");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ReconciliationBreaks");

            migrationBuilder.DropTable(
                name: "ReconciliationBatches");

            migrationBuilder.DropIndex(
                name: "IX_Price_BatchId",
                table: "Prices");

            migrationBuilder.DropIndex(
                name: "IX_Price_BookOfRecord_Status",
                table: "Prices");

            migrationBuilder.DropIndex(
                name: "IX_Holding_BatchId",
                table: "Holdings");

            migrationBuilder.DropIndex(
                name: "IX_Holding_BookOfRecord_Status",
                table: "Holdings");

            migrationBuilder.DropIndex(
                name: "IX_CashFlow_Account_Category_Date",
                table: "CashFlows");

            migrationBuilder.DropIndex(
                name: "IX_CashFlow_Account_Date",
                table: "CashFlows");

            migrationBuilder.DropIndex(
                name: "IX_CashFlow_BatchId",
                table: "CashFlows");

            migrationBuilder.DropIndex(
                name: "IX_CashFlow_BookOfRecord_Status",
                table: "CashFlows");

            migrationBuilder.DropIndex(
                name: "IX_CashFlow_Type",
                table: "CashFlows");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Prices");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Prices");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Prices");

            migrationBuilder.DropColumn(
                name: "BookOfRecord",
                table: "Prices");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Prices");

            migrationBuilder.DropColumn(
                name: "SubmittedBy",
                table: "Prices");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Holdings");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Holdings");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Holdings");

            migrationBuilder.DropColumn(
                name: "BookOfRecord",
                table: "Holdings");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Holdings");

            migrationBuilder.DropColumn(
                name: "SubmittedBy",
                table: "Holdings");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "CashFlows");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "CashFlows");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "CashFlows");

            migrationBuilder.DropColumn(
                name: "BookOfRecord",
                table: "CashFlows");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "CashFlows");

            migrationBuilder.DropColumn(
                name: "SubmittedBy",
                table: "CashFlows");

            migrationBuilder.RenameIndex(
                name: "IX_Price_Instrument_Date",
                table: "Prices",
                newName: "IX_Prices_InstrumentId_Date");

            migrationBuilder.RenameIndex(
                name: "IX_Holding_Account_Instrument_Date",
                table: "Holdings",
                newName: "IX_Holdings_AccountId_InstrumentId_Date");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Prices",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Prices",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Holdings",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Holdings",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "CashFlows",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "TransactionReference",
                table: "CashFlows",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "CashFlows",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "CashFlows",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.CreateIndex(
                name: "IX_CashFlows_AccountId",
                table: "CashFlows",
                column: "AccountId");
        }
    }
}
