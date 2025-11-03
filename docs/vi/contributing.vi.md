# Hướng Dẫn Đóng Góp CCS

## Nguyên Tắc Phát Triển

### Triết Lý

CCS tuân theo các nguyên tắc cốt lõi sau:

- **YAGNI**: Không có tính năng "phòng hờ"
- **KISS**: Bash đơn giản, không phức tạp
- **DRY**: Một nguồn chân lý duy nhất (config)

Công cụ này chỉ LÀM MỘT việc tốt: ánh xạ tên profile đến file settings.

### Tiêu Chuẩn Code

#### Yêu Cầu Tương Thích

- **Unix**: tương thích bash 3.2+
- **Windows**: tương thích PowerShell 5.1+
- **Dependencies**: Chỉ jq (Unix) hoặc PowerShell có sẵn (Windows)

#### Phong Cách Code

**Bash (Unix)**:
- Sử dụng shebang `#!/usr/bin/env bash`
- Quote variables: `"$VAR"` không phải `$VAR`
- Sử dụng `[[ ]]` cho tests, không phải `[ ]`
- Tuân theo mẫu thụt lề và đặt tên hiện có

**PowerShell (Windows)**:
- Sử dụng `CmdletBinding` và xử lý parameter đúng cách
- Tuân theo quy ước động-tên của PowerShell
- Sử dụng xử lý lỗi đúng cách với `try/catch`
- Duy trì tương thích với PowerShell 5.1+

### Kiểm Thử

#### Kiểm Thử Nền Tảng

Kiểm tra trên tất cả nền tảng trước khi gửi PR:
- macOS (bash)
- Linux (bash)
- Windows (PowerShell, CMD, Git Bash)

#### Kịch Bản Kiểm Thử

1. **Chức năng cơ bản**:
   ```bash
   ccs            # Nên dùng profile mặc định
   ccs glm        # Nên dùng profile GLM
   ccs --version  # Nên hiển thị phiên bản
   ```

2. **Với arguments**:
   ```bash
   ccs glm --help
   ccs /plan "test"
   ```

3. **Xử lý lỗi**:
   ```bash
   ccs invalid-profile    # Nên hiển thị lỗi
   ccs --invalid-flag     # Nên chuyển cho Claude
   ```

### Quy Trình Gửi

#### Trước Khi Gửi

1. Fork repository
2. Tạo feature branch: `git checkout -b feature-name`
3. Thực hiện thay đổi của bạn
4. Kiểm tra trên tất cả nền tảng
5. Đảm bảo các tests hiện có passes

#### Yêu Cầu Pull Request

- Mô tả rõ ràng các thay đổi
- Hướng dẫn kiểm thử nếu có
- Link đến các issues liên quan
- Tuân theo kiểu commit message hiện có

#### Kiểu Commit Message

```
type(scope): description

[optional body]

[optional footer]
```

Ví dụ:
```
fix(installer): handle git worktree detection
feat(config): support custom config location
docs(readme): update installation instructions
```

### Thiết Lập Phát Triển

#### Phát Triển Địa Phương

```bash
# Clone fork của bạn
git clone https://github.com/yourusername/ccs.git
cd ccs

# Tạo feature branch
git checkout -b your-feature-name

# Thực hiện thay đổi
# Kiểm tra địa phương với ./ccs

# Chạy tests
./test.sh  # nếu có
```

#### Kiểm Thử Installer

```bash
# Kiểm thử installer Unix
./installers/install.sh

# Kiểm thử installer Windows (trong PowerShell)
.\installers\install.ps1
```

### Lĩnh Vực Đóng Góp

#### Tính Năng Mong Muốn

1. **Hỗ trợ profile bổ sung**:
   - Validation profile tùy chỉnh
   - Lối tắt chuyển profile

2. **Xử lý lỗi nâng cao**:
   - Thông báo lỗi tốt hơn
   - Gợi ý khôi phục

3. **Tài liệu**:
   - Nhiều ví dụ hơn
   - Hướng dẫn tích hợp

#### Sửa Lỗi

- Vấn đề installer trên các nền tảng khác nhau
- Edge cases trong parsing config
- Tương thích riêng của Windows

### Quy Trình Review

1. **Kiểm tra tự động**:
   - Validation cú pháp
   - Tests chức năng cơ bản

2. **Review thủ công**:
   - Chất lượng và phong cách code
   - Tương thích nền tảng
   - Phù hợp với triết lý

3. **Kiểm thử**:
   - Xác nhận đa nền tảng
   - Kiểm thử tích hợp

### Cộng Đồng

#### Nhận Trợ Giúp

- GitHub Issues: Báo lỗi hoặc yêu cầu tính năng
- Discussions: Hỏi câu hỏi hoặc chia sẻ ý tưởng

#### Quy Tắc Ứng Xử

Hãy tôn trọng, mang tính xây dựng, và tập trung vào triết lý đơn giản và đáng tin cậy của dự án.

---

**Cảm ơn bạn đã đóng góp cho CCS!**

Hãy nhớ: Giữ nó đơn giản, kiểm thử kỹ lưỡng, và trung thành với triết lý YAGNI/KISS/DRY.