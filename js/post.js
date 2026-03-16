document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://backend-production-5853.up.railway.app/api/v1/boards";

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("잘못된 접근입니다.");
    return;
  }

  const renderPost = (post) => {
    document.getElementById("post-title").innerText = post.title;
    document.getElementById("post-author").innerText = post.user?.name || "익명";
    document.getElementById("post-generation").innerText = post.category;

    const date = new Date(post.created_at);
    document.getElementById("post-date").innerText = date.toLocaleDateString();
    document.getElementById("post-content").innerHTML = post.content;
  };

  const getLoginUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("User JSON parse error:", error);
      return null;
    }
  };

  const bindPostActions = (postId) => {
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = `../write/?id=${postId}`;
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("정말 삭제하시겠습니까?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");

        try {
          const res = await fetch(`${API_BASE}/${postId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            alert("삭제 실패");
            return;
          }

          alert("삭제되었습니다.");
          window.location.href = "../";
        } catch (error) {
          console.error(error);
          alert("삭제 중 오류 발생");
        }
      });
    }
  };

  const bindPrevNextButtons = async (postId) => {
    const listRes = await fetch(API_BASE);
    const listData = await listRes.json();

    const posts = (listData.question_list || []).sort((a, b) => b.id - a.id);
    const index = posts.findIndex((post) => String(post.id) === String(postId));

    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");

    if (!prevBtn || !nextBtn || index === -1) return;

    const prevPost = posts[index + 1];
    const nextPost = posts[index - 1];

    if (prevPost) {
      prevBtn.onclick = () => {
        window.location.href = `./?id=${prevPost.id}`;
      };
    } else {
      prevBtn.classList.remove("hover:text-gray-900");
      prevBtn.classList.add("text-gray-300");
      prevBtn.onclick = null;
    }

    if (nextPost) {
      nextBtn.onclick = () => {
        window.location.href = `./?id=${nextPost.id}`;
      };
    } else {
      nextBtn.classList.remove("hover:text-gray-900");
      nextBtn.classList.add("text-gray-300");
      nextBtn.onclick = null;
    }
  };

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("불러오기 실패");

    const postData = await res.json();
    renderPost(postData);

    const token = localStorage.getItem("token");
    const loginUser = getLoginUser();

    if (token && loginUser && loginUser.id === postData.user?.id) {
      const postActions = document.getElementById("post-actions");
      if (postActions) postActions.classList.remove("hidden");
    }

    bindPostActions(id);
    await bindPrevNextButtons(id);
  } catch (error) {
    console.error(error);
    alert("게시글을 불러오지 못했습니다.");
  }
});
