# Hướng Dẫn Cấu Hình CCS

## Cấu Hình Tự Động

Installer tự động tạo config và mẫu profile trong quá trình cài đặt:

**macOS / Linux**: `~/.ccs/config.json`

**Windows**: `%USERPROFILE%\.ccs\config.json`

## Định Dạng Cấu Hình

### Cài Đặt Cơ Bản

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

### Cài Đặt Nâng Cao (Nhiều Profile)

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "haiku": "~/.ccs/haiku.settings.json",
    "custom": "~/.ccs/custom.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

## Cấu Hình Profile

### Ví Dụ Profile GLM

**Vị trí**: `~/.ccs/glm.settings.json`

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your_glm_api_key",
    "ANTHROPIC_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.6"
  }
}
```

### Profile Claude (Mặc Định)

- Sử dụng `~/.claude/settings.json` (config Claude CLI hiện tại của bạn)
- CCS không bao giờ sửa file này (tiếp cận không xâm phạm)

## Cách Hoạt Động Cấu Hình

1. CCS đọc tên profile từ dòng lệnh (mặc định là "default")
2. Tìm đường dẫn file settings trong `~/.ccs/config.json`
3. Thực thi `claude --settings <file> [remaining-args]`

Không có magic. Không sửa file. Chuyển giao thuần túy. Hoạt động giống nhau trên tất cả nền tảng.

## Vị Trí Config Tùy Chỉnh

```bash
export CCS_CONFIG=~/my-custom-config.json
ccs glm
```

## Lưu Ý Tùy Theo Nền Tảng

### Cấu Hình Windows

Windows dùng cấu trúc file và phương pháp giống như Linux/macOS.

**Định dạng config** (`~/.ccs/config.json`):
```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

### Cấu Hình macOS / Linux

Sử dụng đường dẫn file settings với mở rộng `~`:

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

Mỗi profile trỏ đến một file settings JSON của Claude. Tạo file settings theo [tài liệu Claude CLI](https://docs.claude.com/en/docs/claude-code/installation).

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