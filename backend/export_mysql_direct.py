# export_mysql_direct.py
import os
import json
import MySQLdb
from datetime import datetime

def export_mysql_direct():
    print("🚨 DIRECT MYSQL EXPORT (Emergency Backup)")
    print("=" * 50)
    
    # Your Railway MySQL credentials - FROM YOUR CONNECTION URL
    db_config = {
        'host': 'ballast.proxy.rlwy.net',
        'port': 13703,
        'user': 'root',
        'passwd': 'uFdPqvHYjVgfYRbslWANJEQYNPXCZlom',  # Your password from URL
        'db': 'railway',
        'charset': 'utf8mb4'
    }
    
    try:
        # Connect to Railway MySQL
        print("🔌 Connecting to Railway MySQL...")
        connection = MySQLdb.connect(**db_config)
        cursor = connection.cursor()
        
        # Get list of tables
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        all_data = {}
        
        for table in tables:
            try:
                print(f"📦 Exporting table: {table}")
                
                # Get table structure
                cursor.execute(f"DESCRIBE {table}")
                columns = [col[0] for col in cursor.fetchall()]
                
                # Get all data
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                
                # Convert to list of dicts
                table_data = []
                for row in rows:
                    row_dict = {}
                    for i, col in enumerate(columns):
                        # Handle datetime serialization
                        if isinstance(row[i], datetime):
                            row_dict[col] = row[i].isoformat()
                        else:
                            row_dict[col] = row[i]
                    table_data.append(row_dict)
                
                all_data[table] = {
                    'columns': columns,
                    'data': table_data
                }
                
                print(f"   ✅ Exported {len(rows)} records")
                
            except Exception as e:
                print(f"   ⚠️  Error exporting {table}: {e}")
        
        # Save to file
        backup_file = f"railway_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(backup_file, 'w') as f:
            json.dump(all_data, f, indent=2, default=str)
        
        print(f"\n💾 Backup saved to: {backup_file}")
        print(f"📊 Total tables exported: {len(tables)}")
        
        connection.close()
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n⚠️  Common issues:")
        print("   1. Railway might have already expired/stopped")
        print("   2. Network/firewall blocking connection")
        print("   3. Try using the mysqldump command instead")

if __name__ == "__main__":
    export_mysql_direct()