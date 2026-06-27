# 홈페이지 미리보기(Preview) 실행 방법

이 저장소는 [Jekyll](https://jekyllrb.com/)로 만들어진 GitHub Pages 홈페이지입니다.
`.md` 파일을 수정한 뒤 실제 사이트가 어떻게 보이는지 내 컴퓨터에서 미리 확인하려면
아래 과정을 따라 로컬 서버를 띄우면 됩니다. Jekyll을 잘 몰라도 따라할 수 있도록 정리했습니다.

## 1. 필요한 프로그램 (최초 1회만 설치)

- **Git**: 저장소를 받아오고(clone) 변경 사항을 올리기(push) 위해 필요합니다.
- **Ruby**: Jekyll은 Ruby로 만들어진 프로그램입니다.
  - macOS에 기본 내장된 Ruby는 버전이 너무 오래되어 이 저장소의 `Gemfile.lock`과 맞지 않습니다.
    [Homebrew](https://brew.sh/)로 새 Ruby를 설치하세요.

    ```bash
    brew install ruby
    ```
- **Bundler**: Ruby용 패키지(gem) 관리 도구로, Ruby와 함께 설치됩니다.

## 2. 저장소 준비 (최초 1회만)

```bash
git clone https://github.com/cau-aisl/cau-aisl.github.io.git
cd cau-aisl.github.io
```

이미 클론되어 있다면 폴더로 이동만 하면 됩니다.

## 3. 실행 방법

### macOS

터미널(Terminal)을 열고 아래 명령어를 순서대로 입력합니다.

```bash
cd 경로/cau-aisl.github.io          # 저장소 폴더로 이동
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"   # Homebrew Ruby 사용
export RUBYOPT="-rbigdecimal"        # 최신 Ruby에서 bigdecimal 오류 방지
bundle install                       # 필요한 패키지 설치 (처음 실행할 때 또는 Gemfile이 바뀌었을 때)
bundle exec jekyll serve              # 로컬 서버 실행
```

매번 `export ...`를 입력하기 귀찮다면, `~/.zshrc`에 추가해두면 새 터미널을 열 때마다 자동으로 적용됩니다.

```bash
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
echo 'export RUBYOPT="-rbigdecimal"' >> ~/.zshrc
```

### Windows

명령 프롬프트(cmd)를 열고 저장소 폴더로 이동한 뒤 실행합니다.

```cmd
cd 경로\cau-aisl.github.io
bundle exec jekyll serve
```

### 실행 후

터미널에 다음과 같은 메시지가 보이면 정상적으로 실행된 것입니다.

```text
Server address: http://127.0.0.1:4000/
Server running... press ctrl-c to stop.
```

브라우저에서 **<http://localhost:4000>** 으로 접속하면 수정한 내용이 반영된 홈페이지를 바로 확인할 수 있습니다.
`.md` 파일을 저장할 때마다 자동으로 다시 빌드되므로, 브라우저를 새로고침만 하면 됩니다.

서버를 끄려면 터미널에서 `Ctrl + C`를 누릅니다.

## 4. 자주 발생하는 오류

- **`cannot load such file -- bigdecimal` 오류**
  최신 Ruby(3.4 이상)에서는 `bigdecimal`이 기본 포함되지 않아 발생합니다. 위 macOS 실행 방법에 있는 `export RUBYOPT="-rbigdecimal"`을 빠뜨렸는지 확인하세요. 그래도 안 되면 gem이 설치되어 있는지 확인합니다.

  ```bash
  gem install bigdecimal
  ```

- **`Address already in use` 오류 (포트 4000이 이미 사용 중)**
  이미 다른 터미널/프로세스에서 미리보기 서버가 실행 중인 경우입니다.
  - 기존에 띄워둔 서버가 있다면 그냥 브라우저에서 `http://localhost:4000`으로 접속해도 됩니다.
  - 새로 띄우고 싶다면 기존 프로세스를 종료한 뒤 다시 실행하세요. 서버를 띄운 터미널 창이 남아있다면 그 창에서 `Ctrl + C`를 누르면 됩니다.
  - 서버를 띄운 터미널 창을 닫아버렸거나 어떤 프로세스가 포트를 쓰고 있는지 모를 때는, 새 터미널에서 아래처럼 확인 후 종료할 수 있습니다.

    ```bash
    lsof -i :4000        # 포트 4000을 사용 중인 프로세스 확인 (PID 열 확인)
    kill <PID>           # 위에서 확인한 PID로 종료 (예: kill 7367)
    ```

  - 그래도 안 끝나면 강제로 종료합니다: `kill -9 <PID>`
  - 굳이 끄지 않고 다른 포트로 새로 띄우려면: `bundle exec jekyll serve --port 4001`

- **`Could not find 'bundler' (x.x.x) required by your Gemfile.lock` 오류**
  설치된 Bundler 버전이 `Gemfile.lock`에 적힌 버전과 다른 경우입니다. Ruby를 최신 버전(Homebrew 등)으로 설치하면 함께 해결되는 경우가 많습니다.

## 5. 변경 사항 반영 (배포)

로컬 미리보기는 내 컴퓨터에서만 보이는 화면입니다. 실제 홈페이지(`https://cau-aisl.github.io`)에 반영하려면
변경한 파일을 커밋한 뒤 `gh-pages` 브랜치에 push 해야 합니다.

```bash
git add .
git commit -m "변경 내용 설명"
git push
```

push 후 GitHub Pages가 자동으로 다시 빌드되며, 보통 1~2분 내에 실제 사이트에 반영됩니다.
