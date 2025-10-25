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

        // ABoR/IBoR Workflow fields
        builder.Property(cf => cf.BookOfRecord)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(cf => cf.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(cf => cf.SubmittedBy)
            .HasMaxLength(255);

        builder.Property(cf => cf.ApprovedBy)
            .HasMaxLength(255);

        // Indexes for performance
        builder.HasIndex(cf => new { cf.AccountId, cf.Date })
            .HasDatabaseName("IX_CashFlow_Account_Date");

        builder.HasIndex(cf => new { cf.AccountId, cf.Category, cf.Date })
            .HasDatabaseName("IX_CashFlow_Account_Category_Date");

        builder.HasIndex(cf => cf.Type)
            .HasDatabaseName("IX_CashFlow_Type");

        builder.HasIndex(cf => new { cf.BookOfRecord, cf.Status })
            .HasDatabaseName("IX_CashFlow_BookOfRecord_Status");

        builder.HasIndex(cf => cf.BatchId)
            .HasDatabaseName("IX_CashFlow_BatchId");

        // Foreign key relationships
        builder.HasOne(cf => cf.Account)
            .WithMany(a => a.CashFlows)
            .HasForeignKey(cf => cf.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cf => cf.Batch)
            .WithMany()
            .HasForeignKey(cf => cf.BatchId)
            .OnDelete(DeleteBehavior.SetNull);

        // Default values - PostgreSQL syntax
        builder.Property(cf => cf.CreatedAt)
            .HasDefaultValueSql("NOW()");

        builder.Property(cf => cf.UpdatedAt)
            .HasDefaultValueSql("NOW()");
    }
}
