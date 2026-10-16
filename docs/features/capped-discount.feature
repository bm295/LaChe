# Giảm giá có mức trần

Tỷ lệ trên giao diện là phần trăm; API `GET /bills/estimate` nhận
`discountRate` từ 0 đến 1 và `maximumDiscount` bằng VND.
Nếu không cung cấp, cả hai mặc định bằng 0 (không giảm giá).
Phí phục vụ 10% và VAT 8% tính sau giảm giá; các khoản được làm tròn
hai chữ số thập phân khi trả kết quả, không làm tròn trung gian.

```gherkin
Feature: Giảm giá có mức trần
  As a nhân viên thu ngân
  I want to áp dụng giảm giá theo tỷ lệ với mức trần
  So that tiền giảm không vượt giới hạn của chương trình

  Background:
    Given phí phục vụ là 10%
    And VAT là 8% trên tạm tính sau giảm giá cộng phí phục vụ

  Scenario: Giảm giá có mức trần
    Given tạm tính hóa đơn là 1000000 VND
    And tỷ lệ giảm giá là 20%
    And mức trần giảm giá là 100000 VND
    When nhân viên yêu cầu tính hóa đơn trên client
    Then client hiển thị tiền giảm giá là 100000 VND
    And phí phục vụ là 90000 VND
    And VAT là 79200 VND
    And tổng thanh toán là 1069200 VND

  Scenario Outline: Giảm giá dưới trần và tại các giới hạn
    Given tạm tính hóa đơn là <subtotal> VND
    And tỷ lệ giảm giá là <percent>%
    And mức trần giảm giá là <cap> VND
    When nhân viên yêu cầu tính hóa đơn
    Then tiền giảm giá là <discount> VND
    And tổng thanh toán là <total> VND

    Examples:
      | subtotal | percent | cap    | discount | total  |
      | 200000   | 20      | 100000 | 40000    | 190080 |
      | 500000   | 20      | 100000 | 100000   | 475200 |
      | 100000   | 0       | 100000 | 0        | 118800 |
      | 100000   | 20      | 0      | 0        | 118800 |
      | 100000   | 100     | 200000 | 100000   | 0      |
      | 0        | 20      | 100000 | 0        | 0      |

  Scenario: Dữ liệu giảm giá không hợp lệ
    Given tạm tính hoặc mức trần âm, tỷ lệ ngoài 0 đến 100%, hoặc giá trị không phải số hữu hạn
    When yêu cầu tính hóa đơn được gửi đến API
    Then API trả HTTP 400
    And client hiển thị lỗi thay vì kết quả hóa đơn
```
