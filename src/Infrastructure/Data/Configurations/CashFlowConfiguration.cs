using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class CashFlowConfiguration : IEntityTypeConfiguration<CashFlow>
{
    public void Configure(EntityTypeBuilder<CashFlow> builder)
    {
        builder.HasKey(cf => cf.Id);

        builder.Property(cf => cf.Amount)
            .HasPrecision(18, 6)
            .IsRequired();

        builder.Property(cf => cf.Description)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(cf => cf.TransactionReference)
            .HasMaxLength(100);

        builder.Property(cf => cf.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(cf => cf.Category)
            .HasConversion<int>()
            .IsRequired();

        // Indexes for performance
        builder.HasIndex(cf => new { cf.AccountId, cf.Date })
            .HasDatabaseName("IX_CashFlow_Account_Date");

        builder.HasIndex(cf => new { cf.AccountId, cf.Category, cf.Date })
            .HasDatabaseName("IX_CashFlow_Account_Category_Date");

        builder.HasIndex(cf => cf.Type)
            .HasDatabaseName("IX_CashFlow_Type");

        // Foreign key relationship
        builder.HasOne(cf => cf.Account)
            .WithMany(a => a.CashFlows)
            .HasForeignKey(cf => cf.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Default values
        builder.Property(cf => cf.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(cf => cf.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}
