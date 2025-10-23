from django.contrib import admin
from .models import Category, Product
# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'parent']
    list_filter = ['tenant',]
    search_fields = ['name']
    list_select_related = ['tenant']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name','sku','barcode', 'tenant', 'Category', 'price', 'stock_quantity', 'is_active']    
    list_filter = ['tenant', 'Category', 'is_active']
    search_fields = ['name', 'sku', 'barcode']
    list_editable = ['price', 'stock_quantity', 'is_active']
    list_select_related = ['tenant', 'Category']
    readonly_fields = ['sku', 'barcode']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'tenant', 'Category')
        }),
        ('Pricing', {
            'fields': ('price', 'compare_at_price', 'cost_price')
        }),
        ('Inventory', {
            'fields': ('track_quantity', 'stock_quantity', 'is_active')
        }),
        ('Auto-generated Fields', {
            'fields': ('sku', 'barcode'),
            'description': 'These fields are automatically generated when you save the product.'
        }),
    )
