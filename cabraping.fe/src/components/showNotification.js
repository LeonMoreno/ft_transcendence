
export function showNotification(message, type) {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');

  notification.classList.add('text-white', 'p-2', "rounded-3", "m-2", "shadow", 'd-inline-block', 'notification');
  if (type === "success")
    notification.classList.add("bg-success");
  else{
    notification.classList.add("bg-danger");
  }

  notification.textContent = message;

  container.appendChild(notification);

  // Automatically remove the notification after 5 seconds
  setTimeout(() => {
      container.removeChild(notification);
  }, 3000);
}
