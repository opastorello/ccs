# Hướng Dẫn Khắc Phục Sự Cố CCS

## Vấn Đề Riêng Của Windows

### PowerShell Execution Policy

Nếu bạn thấy "cannot be loaded because running scripts is disabled":

```powershell
# Kiểm tra policy hiện tại
Get-ExecutionPolicy

# Cho phép user hiện tại chạy scripts (khuyến nghị)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Hoặc chạy với bypass (một lần)
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.ccs\ccs.ps1" glm
```

### PATH chưa được cập nhật (Windows)

Nếu lệnh `ccs` không tìm thấy sau khi cài đặt:

1. Khởi động lại terminal của bạn
2. Hoặc thêm thủ công vào PATH:
   - Mở "Edit environment variables for your account"
   - Thêm `%USERPROFILE%\.ccs` vào User PATH
   - Khởi động lại terminal

### Claude CLI không tìm thấy (Windows)

```powershell
# Kiểm tra Claude CLI
where.exe claude

# Nếu thiếu, cài đặt từ tài liệu Claude
```

## Vấn Đề Cài Đặt

### Lỗi BASH_SOURCE unbound variable

Lỗi này xảy ra khi chạy installer trong một số shells hoặc môi trường.

**Đã sửa trong phiên bản mới nhất**: Installer bây giờ xử lý cả thực thi qua pipe (`curl | bash`) và thực thi trực tiếp (`./install.sh`).

**Giải pháp**: Nâng cấp lên phiên bản mới nhất:
```bash
curl -fsSL https://raw.githubusercontent.com/kaitranntt/ccs/main/installers/install.sh | bash
```

### Git worktree không được phát hiện

Nếu cài từ git worktree hoặc submodule, các phiên bản cũ có thể không phát hiện repository git.

**Đã sửa trong phiên bản mới nhất**: Installer bây giờ phát hiện cả thư mục `.git` (clone chuẩn) và file `.git` (worktree/submodule).

**Giải pháp**: Nâng cấp lên phiên bản mới nhất hoặc dùng phương pháp cài đặt curl.

## Vấn Đề Cấu Hình

### Không tìm thấy profile

```
Error: Profile 'foo' not found in ~/.ccs/config.json
```

**Fix**: Thêm profile vào `~/.ccs/config.json`:
```json
{
  "profiles": {
    "foo": "~/.ccs/foo.settings.json"
  }
}
```

### Thiếu file settings

```
Error: Settings file not found: ~/.ccs/foo.settings.json
```

**Fix**: Tạo file settings hoặc sửa đường dẫn trong config.

### jq chưa được cài đặt

```
Error: jq is required but not installed
```

**Fix**: Cài đặt jq (xem hướng dẫn cài đặt).

**Lưu ý**: Installer tạo các mẫu cơ bản ngay cả khi không có jq, nhưng các tính năng nâng cao cần jq.

## Vấn Đề Môi Trường

### PATH chưa được thiết lập

```
⚠️  Warning: ~/.local/bin is not in PATH
```

**Fix**: Thêm vào `~/.bashrc` hoặc `~/.zshrc`:
```bash
export PATH="$HOME/.local/bin:$PATH"
```
Sau đó `source ~/.bashrc` hoặc khởi động lại shell.

### Thiếu profile mặc định

```
Error: Profile 'default' not found in ~/.ccs/config.json
```

**Fix**: Thêm profile "default" hoặc luôn chỉ định tên profile:
```json
{
  "profiles": {
    "default": "~/.claude/settings.json"
  }
}
```

## Vấn Đề Phổ Biến

### Claude CLI không tìm thấy

```
Error: claude command not found
```

**Giải pháp**: Cài đặt Claude CLI từ [tài liệu chính thức](https://docs.claude.com/en/docs/claude-code/installation).

### Permission denied (Unix)

```
Error: Permission denied: ~/.local/bin/ccs
```

**Giải pháp**: Cho phép script thực thi:
```bash
chmod +x ~/.local/bin/ccs
```

### Không tìm thấy file config

```
Error: Config file not found: ~/.ccs/config.json
```

**Giải pháp**: Chạy lại installer hoặc tạo config thủ công:
```bash
mkdir -p ~/.ccs
echo '{"profiles":{"default":"~/.claude/settings.json"}}' > ~/.ccs/config.json
```

## Nhận Trợ Giúp

Nếu bạn gặp các vấn đề không được đề cập ở đây:

1. Kiểm tra [GitHub Issues](https://github.com/kaitranntt/ccs/issues)
2. Tạo issue mới với:
   - Hệ điều hành của bạn
   - Phiên bản CCS (`ccs --version`)
   - Thông báo lỗi chính xác
   - Các bước để tái tạo vấn đề

## Chế Độ Debug

Bật verbose output để khắc phục sự cố:

```bash
ccs --verbose glm
```

Điều này sẽ hiển thị:
- File config nào đang được đọc
- Profile nào đang được chọn
- File settings nào đang được sử dụng
- Lệnh chính xác đang được thực thi