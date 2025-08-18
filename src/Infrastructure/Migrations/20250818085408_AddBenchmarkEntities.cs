using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBenchmarkEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Benchmarks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Benchmarks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BenchmarkHoldings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    BenchmarkId = table.Column<Guid>(type: "TEXT", nullable: false),
                    InstrumentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Weight = table.Column<decimal>(type: "TEXT", precision: 18, scale: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BenchmarkHoldings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BenchmarkHoldings_Benchmarks_BenchmarkId",
                        column: x => x.BenchmarkId,
                        principalTable: "Benchmarks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BenchmarkHoldings_Instruments_InstrumentId",
                        column: x => x.InstrumentId,
                        principalTable: "Instruments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BenchmarkHoldings_BenchmarkId",
                table: "BenchmarkHoldings",
                column: "BenchmarkId");

            migrationBuilder.CreateIndex(
                name: "IX_BenchmarkHoldings_InstrumentId",
                table: "BenchmarkHoldings",
                column: "InstrumentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BenchmarkHoldings");

            migrationBuilder.DropTable(
                name: "Benchmarks");
        }
    }
}
