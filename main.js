"use strict";

import { getComments, postComments } from "./api.js";
import { handleKeyPress, sendCommentsByEnter } from "./handleKeyPress.js";

const buttonElement = document.getElementById("add-button");
const listElement = document.getElementById("comments");
const nameInputElement = document.querySelector(".add-form-name");
const commentElement = document.querySelector(".add-form-text");
const loadingElement = document.querySelector(".loading-comments");

const getFormattedDate = () => {
  const date = new Date();
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("ru-RU", options);
};

let comments = [];

// Рендер комментариев
const renderComments = () => {
  getComments({ comments }).then((responseData) => {
    const commentsHtml = responseData
      .map((comment, index) => {
        comment.text = comment.text
          .replaceAll("QUOTE_BEGIN", "<div class='quote'>")
          .replaceAll("QUOTE_END", "</div>");
        let activeLike;
        comment.isLiked ? (activeLike = "-active-like") : "";
        return `
        <li class="comment">
            <div class="comment-header">
              <div>${comment.author.name}</div>
              <div>${comment.date}</div>
            </div>
            <div class="comment-body" data-comment=${index}>
              <div class="comment-text">
                ${comment.text}
              </div>
            </div>
            <div class="comment-footer">
              <div class="likes">
                <span class="likes-counter">${comment.likes}</span>
                <button data-index=${index} class="like-button ${activeLike}"></button>
              </div>
            </div>
          </li>`;
      })
      .join("");

    listElement.innerHTML = commentsHtml;
    loadingElement.style.display = "none";
    buttonElement.disabled = false;
    getFormattedDate();
    initLikeButtonElement();
    initQuoteComment();
  });
};

//Ответить другому юзеру
const initQuoteComment = () => {
  const quoteComment = document.querySelectorAll(".comment-body");
  const commentElement = document.querySelector(".add-form-text");

  for (const quoteComments of quoteComment) {
    quoteComments.addEventListener("click", (e) => {
      const index = quoteComments.dataset.comment;
      commentElement.value = `QUOTE_BEGIN ${comments[index].author.name}:\n ${comments[index].text} QUOTE_END`;
    });
  }
};

// Поставить лайк
const initLikeButtonElement = () => {
  const likeButtons = document.querySelectorAll(".like-button");

  for (const likeButton of likeButtons) {
    likeButton.addEventListener("click", () => {
      const index = likeButton.dataset.index;
      if (comments[index].isLiked === false) {
        comments[index].isLiked = true;
        comments[index].likes++;
      } else {
        comments[index].isLiked = false;
        comments[index].likes--;
      }
      renderComments();
    });
  }
};

// Отправка по клику на интер
handleKeyPress({ buttonElement });
sendCommentsByEnter({ buttonElement, nameInputElement, commentElement });

// Дизейбл кнопки "отправить"
nameInputElement.addEventListener("input", () => {
  buttonElement.disabled = false;
});
commentElement.addEventListener("input", () => {
  buttonElement.disabled = false;
});

renderComments();

// Клик по кнопке "Отправить"
buttonElement.addEventListener("click", () => {
  buttonElement.disabled = true;
  buttonElement.textContent = "Добавляется";
  loadingElement.style.display = "block";

  if (nameInputElement.value === "" && commentElement.value === "") {
    nameInputElement.classList.add("error");
    commentElement.classList.add("error");
    return;
  } else if (nameInputElement.value === "" && commentElement.value !== "") {
    nameInputElement.classList.add("error");
    commentElement.classList.remove("error");
    return;
  } else if (commentElement.value === "" && nameInputElement.value !== "") {
    commentElement.classList.add("error");
    nameInputElement.classList.remove("error");
    return;
  }

  const saveName = nameInputElement.value;
  const saveComment = commentElement.value;

  postComments({ name: nameInputElement.value, text: commentElement.value })
    .then(() => {
      renderComments();
    })
    .then(() => {
      buttonElement.disabled = true;
      buttonElement.textContent = "Написать";
      nameInputElement.value = "";
      commentElement.value = "";
    })
    .catch((error) => {
      buttonElement.disabled = false;
      buttonElement.textContent = "Написать";

      if (error.message === "400: Некорректный запрос") {
        alert("Имя и комментарий должны содержать больше 3 символов");
      } else if (error.message === "500: Внутренняя ошибка сервера") {
        alert("Ошибка 500: Внутренняя ошибка сервера");
      } else {
        alert("Кажется у тебя сломался интернет");
      }

      nameInputElement.value = saveName;
      commentElement.value = saveComment;
    });

  initLikeButtonElement();
  renderComments();
  commentElement.classList.remove("error");
  nameInputElement.classList.remove("error");
});
