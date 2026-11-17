$ErrorActionPreference='Stop'
Add-Type -AssemblyName PresentationFramework,PresentationCore,WindowsBase
[xml]$markup=@"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" Title="franks-screencast 演示窗口（非 IM 产品）" Width="1100" Height="700" WindowStartupLocation="CenterScreen" Background="#EEF4FA" FontFamily="Microsoft YaHei" FontSize="22">
<StackPanel Margin="40">
<TextBlock Text="归档会话演示" FontSize="36" FontWeight="Bold" Margin="0,0,0,15"/>
<TextBlock Text="franks-screencast · 独立测试窗口 · 仅演示数据" Margin="0,0,0,35"/>
<StackPanel Orientation="Horizontal">
<TextBox x:Name="Query" AutomationProperties.Name="搜索归档会话" Width="600" Height="50" Padding="8"/>
<Button x:Name="Search" Content="搜索" Width="150" Margin="20,0,0,0"/>
</StackPanel>
<TextBlock x:Name="Status" Text="输入会话名称，查找演示归档。" Margin="0,25,0,20"/>
<Button x:Name="Open" Content="打开星河归档" Width="280" Height="60" HorizontalAlignment="Left" IsEnabled="False"/>
<TextBlock x:Name="Detail" Text="尚未打开归档。" Margin="0,35,0,0" TextWrapping="Wrap"/>
</StackPanel></Window>
"@
$window=[Windows.Markup.XamlReader]::Load([Xml.XmlNodeReader]::new($markup))
$query=$window.FindName('Query');$status=$window.FindName('Status');$open=$window.FindName('Open');$detail=$window.FindName('Detail')
$window.FindName('Search').Add_Click({if($query.Text -eq '星河'){$status.Text='找到 1 条演示归档：星河';$open.IsEnabled=$true}else{$status.Text='没有匹配的演示归档';$open.IsEnabled=$false}})
$open.Add_Click({$detail.Text="归档已打开：星河。演示消息：会议时间已确认，附件和记录均已归档。"})
[void]$window.ShowDialog()
