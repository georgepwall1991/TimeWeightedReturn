using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInstrumentMetadataFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssetClass",
                table: "Instruments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cusip",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DataProviderConfig",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Exchange",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Isin",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreferredDataProvider",
                table: "Instruments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sector",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sedol",
                table: "Instruments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssetClass",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Cusip",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "DataProviderConfig",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Exchange",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Isin",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "PreferredDataProvider",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Sector",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Sedol",
                table: "Instruments");
        }
    }
}
