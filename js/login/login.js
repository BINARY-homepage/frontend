const API_BASE = "https://backend-production-5853.up.railway.app/api/v1";

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = new URLSearchParams({
      username: document.getElementById("identity").value,
      password: document.getElementById("password").value,
    });

    try {
      const loginRes = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!loginRes.ok) {
        alert("로그인 실패");
        return;
      }

      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.access_token);

      const meRes = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        },
      });

      if (!meRes.ok) {
        alert("사용자 정보를 불러오지 못했습니다.");
        return;
      }

      const me = await meRes.json();

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: me.name,
          id: me.id,
        })
      );

      alert("로그인 성공!");
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  });
}
