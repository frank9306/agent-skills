using System.Security.Principal;
using System.IO;
using System.Text.Json;
using AppUse;

if (!OperatingSystem.IsWindows()) return 2;
var build = Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(await File.ReadAllBytesAsync(typeof(Broker).Assembly.Location)))[..12];
var pipe = "AppUse-v1-" + WindowsIdentity.GetCurrent().User!.Value + "-" + build;
try
{
    if (args.Contains("--serve")) { await new Broker(pipe).Run(); return 0; }
    if (args.Contains("--doctor"))
    {
        Console.WriteLine(JsonSerializer.Serialize(new { version = "0.1.0", pipe, os = Environment.OSVersion.ToString(), arch = System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture.ToString(), userScoped = true }));
        return 0;
    }
    // Chrome passes the invoking extension origin as the first argument.
    return await NativeBridge.Run(pipe, args);
}
catch (Exception e) { Console.Error.WriteLine(e.Message); return 1; }
