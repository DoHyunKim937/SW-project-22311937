# Implementation Phase

## 1. Development Environment

본 프로젝트는 HTML, CSS, JavaScript를 사용하여 구현하였다.  
기업 정보와 재무 지표는 로컬 JSON 파일에 저장된 예시 데이터를 사용한다.

## 2. Implementation Language

본 프로젝트는 객체지향을 지원하는 JavaScript를 사용하였다.  
특히 `script.js` 파일에서 JavaScript class 문법을 사용하여 설계 단계의 Class Diagram과 구현 코드가 연결되도록 구성하였다.

## 3. Implemented Files

```text
index.html
style.css
script.js
data/companies.json
README.md
implementation/implementation.md
```

## 4. Object-Oriented Classes

### User

사용자의 ID, Password, Email, 로그인 상태를 관리한다.

### FinancialIndicator

기업의 PER, ROE, PBR, PSR 값을 저장하고 반환한다.

### Company

기업명, 업종, 설명, 재무 지표 객체를 관리한다.

### DataStorage

사용자 정보와 기업 데이터를 저장하고 조회한다.  
사용자 정보는 localStorage에 저장하고, 기업 정보는 JSON 데이터를 사용한다.

### Registration

회원가입 입력값 검사, ID 중복 확인, 사용자 저장 기능을 담당한다.

### Login

로그인 정보 확인과 로그인 성공/실패 처리를 담당한다.

### CompanySelector

기업 목록을 불러오고 사용자가 선택한 기업을 관리한다.

### CompanyInformation

선택한 기업의 기업명, 업종, 설명을 화면에 표시한다.

### PERSearch

선택한 기업의 PER 값을 조회하고 화면에 표시한다.

### IndicatorAnalysis

PER 값을 기준으로 저평가, 적정, 고평가 가능성을 단순 해석한다.

### AdditionalIndicatorSearch

선택한 기업의 ROE, PBR, PSR 값을 조회한다.

### CompanyComparison

두 기업의 PER 값을 비교하고 비교 결과를 생성한다.

### ResetManager

화면에 표시된 선택 기업, 지표, 분석 결과, 비교 결과를 초기화한다.

### MainSystem

전체 시스템 흐름을 관리한다.  
각 기능 클래스들을 연결하고 사용자 이벤트를 처리한다.

## 5. Implemented Functions

### Register

사용자가 ID, Password, Email을 입력하면 localStorage에 사용자 정보가 저장된다.  
이미 존재하는 ID를 입력하면 오류 메시지를 표시한다.

### Login

사용자가 입력한 ID와 Password를 localStorage에 저장된 사용자 정보와 비교한다.  
정보가 일치하면 메인 화면으로 이동한다.

### Company Select

사용자가 기업 목록에서 조회할 기업을 선택할 수 있다.  
선택된 기업은 기업 정보 표시, PER 조회, 추가 지표 조회, 기업 비교 기능에서 사용된다.

### Company Information

선택한 기업의 기업명, 업종, 설명을 화면에 출력한다.

### PER Search

선택한 기업의 PER 값을 조회하여 화면에 표시한다.

### PER Analysis

PER 값을 기준으로 저평가, 적정, 고평가 가능성을 단순하게 해석한다.

### Additional Indicator Search

선택한 기업의 ROE, PBR, PSR 값을 화면에 표시한다.

### Company Comparison

선택한 기업과 비교 기업의 PER 값을 비교하여 결과를 출력한다.

### Reset

화면에 표시된 기업 정보, 재무 지표, 해석 결과, 비교 결과를 초기화한다.

## 6. Important Code Explanation

### JavaScript Class Structure

`script.js`는 함수만 나열한 방식이 아니라 여러 개의 클래스로 역할을 분리하였다.  
예를 들어 로그인은 Login 클래스, 회원가입은 Registration 클래스, 기업 비교는 CompanyComparison 클래스가 담당한다.

### localStorage

회원가입과 로그인 정보는 학습용으로 브라우저의 localStorage에 저장된다.  
실제 서비스에서는 이 방식이 안전하지 않기 때문에 서버와 비밀번호 암호화가 필요하다.

### companies.json

기업 데이터는 `data/companies.json`에 저장된다.  
실시간 금융 API를 사용하지 않고 직접 입력한 예시 데이터를 기반으로 기능을 구현하였다.

### PER Analysis Rule

```text
PER < 10        : 저평가 가능성
10 <= PER <= 25 : 적정 수준
PER > 25        : 고평가 가능성
```

이 기준은 학습용 단순 기준이다.

## 7. Test Result

| Test Item | Expected Result |
|---|---|
| Register | 사용자 정보가 저장된다. |
| Login | 로그인 성공 시 메인 화면으로 이동한다. |
| Company Select | 선택한 기업 정보가 저장된다. |
| PER Search | 선택한 기업의 PER 값이 표시된다. |
| PER Analysis | PER 값에 따른 해석 문장이 표시된다. |
| Additional Indicator | ROE, PBR, PSR 값이 표시된다. |
| Company Comparison | 두 기업의 PER 비교 결과가 표시된다. |
| Reset | 화면 결과가 초기화된다. |

## 8. Limitations

- 실시간 금융 API를 사용하지 않는다.
- 실제 데이터베이스를 사용하지 않는다.
- 로그인 기능은 학습용이며 보안 수준이 낮다.
- 재무 지표 해석 기준은 단순화되어 있다.
