using System.Globalization;
using Domain.Entities;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class PortfolioContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public PortfolioContext(DbContextOptions<PortfolioContext> options) : base(options)
    {
        // Ensure invariant culture is used for database operations
        Database.SetCommandTimeout(TimeSpan.FromMinutes(5));
    }

    // Identity tables
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal precision for all decimal properties
        foreach (var property in modelBuilder.Model
            .GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(6);
        }

        // Client Configuration
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // Portfolio Configuration
        modelBuilder.Entity<Portfolio>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.Client)
                .WithMany(e => e.Portfolios)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Account Configuration
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.AccountNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.Portfolio)
                .WithMany(e => e.Accounts)
                .HasForeignKey(e => e.PortfolioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.AccountNumber).IsUnique();
        });

        // Instrument Configuration
        modelBuilder.Entity<Instrument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Ticker).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.Type).HasConversion<int>();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasIndex(e => e.Ticker).IsUnique();
        });

        // Holding Configuration
        modelBuilder.Entity<Holding>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Units).HasPrecision(18, 6);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.Account)
                .WithMany(e => e.Holdings)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Instrument)
                .WithMany(e => e.Holdings)
                .HasForeignKey(e => e.InstrumentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unique constraint: one holding per account+instrument+date
            entity.HasIndex(e => new { e.AccountId, e.InstrumentId, e.Date }).IsUnique();
        });

        // Price Configuration
        modelBuilder.Entity<Price>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Value).HasPrecision(18, 6);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.Instrument)
                .WithMany(e => e.Prices)
                .HasForeignKey(e => e.InstrumentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: one price per instrument per date
            entity.HasIndex(e => new { e.InstrumentId, e.Date }).IsUnique();
        });

        // FxRate Configuration
        modelBuilder.Entity<FxRate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BaseCurrency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.QuoteCurrency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.Rate).HasPrecision(18, 6);
            entity.Property(e => e.CreatedAt).IsRequired();

            // Unique constraint: one rate per currency pair per date
            entity.HasIndex(e => new { e.BaseCurrency, e.QuoteCurrency, e.Date }).IsUnique();
        });

        // RefreshToken Configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.IpAddress).HasMaxLength(45);

            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
        });
    }

    // DbSets
    public DbSet<Client> Clients { get; set; }
    public DbSet<Portfolio> Portfolios { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Instrument> Instruments { get; set; }
    public DbSet<Holding> Holdings { get; set; }
    public DbSet<Price> Prices { get; set; }
    public DbSet<FxRate> FxRates { get; set; }
    public DbSet<CashFlow> CashFlows { get; set; }
}
