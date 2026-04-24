using ApolloFlowTracks.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .AddJsonFile(@"C:\gitf\ApolloFlow\ApolloFlowTracks\appsettings.json")
    .Build();

var connectionString = config.GetConnectionString("DefaultConnection")!;
var options = new DbContextOptionsBuilder<TracksContext>()
    .UseNpgsql(connectionString)
    .Options;

await using var db = new TracksContext(options);
var tables = await db.Database
    .SqlQueryRaw<string>("select tablename as \"Value\" from pg_tables where schemaname = 'public' order by tablename")
    .ToListAsync();
foreach (var table in tables) System.Console.WriteLine(table);
