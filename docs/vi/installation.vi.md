# Hướng Dẫn Cài Đặt CCS

## Cài Đặt Một Dòng Lệnh (Khuyến Nghị)

### macOS / Linux

```bash
# URL ngắn (qua CloudFlare)
curl -fsSL ccs.kaitran.ca/install | bash

# Hoặc trực tiếp từ GitHub
curl -fsSL https://raw.githubusercontent.com/kaitranntt/ccs/main/installers/install.sh | bash
```

### Windows PowerShell

```powershell
# URL ngắn (qua CloudFlare)
irm ccs.kaitran.ca/install.ps1 | iex

# Hoặc trực tiếp từ GitHub
irm https://raw.githubusercontent.com/kaitranntt/ccs/main/installers/install.ps1 | iex
```

**Lưu ý**:
- Installer Unix hỗ trợ cả chạy trực tiếp (`./install.sh`) và cài đặt qua pipe (`curl | bash`)
- Installer Windows yêu cầu PowerShell 5.1+ (đã cài sẵn trên Windows 10+)

## Cài Đặt qua Git Clone

### macOS / Linux

```bash
git clone https://github.com/kaitranntt/ccs.git
cd ccs
./installers/install.sh
```

### Windows PowerShell

```powershell
git clone https://github.com/kaitranntt/ccs.git
cd ccs
.\installers\install.ps1
```

**Lưu ý**: Hoạt động với git worktrees và submodules - installer phát hiện cả thư mục `.git` và file `.git`.

## Cài Đặt Thủ Công

### macOS / Linux

```bash
# Tải script
curl -fsSL https://raw.githubusercontent.com/kaitranntt/ccs/main/ccs -o ~/.local/bin/ccs
chmod +x ~/.local/bin/ccs

# Đảm bảo ~/.local/bin trong PATH
export PATH="$HOME/.local/bin:$PATH"
```

### Windows PowerShell

```powershell
# Tạo thư mục
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ccs"

# Tải script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/kaitranntt/ccs/main/ccs.ps1" -OutFile "$env:USERPROFILE\.ccs\ccs.ps1"

# Thêm vào PATH (khởi động lại terminal sau)
$Path = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$Path;$env:USERPROFILE\.ccs", "User")
```

## Những Gì Được Cài Đặt

```bash
~/.ccs/
├── ccs                     # Tệp thực thi chính
├── config.json             # Cấu hình profile
├── glm.settings.json       # Profile GLM
└── .claude/                # Tích hợp Claude Code
    ├── commands/ccs.md     # meta-command /ccs
    └── skills/             # Kỹ năng delegation
```

## Nâng Cấp CCS

### macOS / Linux

```bash
# Từ git clone
cd ccs && git pull && ./install.sh

# Từ cài đặt curl
curl -fsSL ccs.kaitran.ca/install | bash
```

### Windows PowerShell

```powershell
# Từ git clone
cd ccs
git pull
.\install.ps1

# Từ cài đặt irm
irm ccs.kaitran.ca/install.ps1 | iex
```

## Yêu Cầu

### macOS / Linux
- `bash` 3.2+
- `jq` (trình xử lý JSON)
- [Claude CLI](https://docs.claude.com/en/docs/claude-code/installation)

### Windows
- PowerShell 5.1+ (đã cài sẵn trên Windows 10+)
- [Claude CLI](https://docs.claude.com/en/docs/claude-code/installation)

### Cài đặt jq (chỉ macOS / Linux)

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Fedora
sudo dnf install jq

# Arch
sudo pacman -S jq
```

**Lưu ý**: Phiên bản Windows dùng JSON support có sẵn của PowerShell - không cần jq.