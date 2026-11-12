document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.querySelector('[data-image-file]');
  const urlInput = document.querySelector('[data-image-url]');
  const previewWrap = document.querySelector('[data-image-preview-wrap]');
  const previewImage = document.querySelector('[data-image-preview]');
  const previewCaption = document.querySelector('[data-image-preview-caption]');
  let objectUrl = null;

  function showPreview(src, caption) {
    if (!src || !previewWrap || !previewImage) return;
    previewImage.src = src;
    previewCaption.textContent = caption;
    previewWrap.hidden = false;
  }

  if (fileInput && previewWrap && previewImage) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.setCustomValidity('');

      if (!file) {
        if (urlInput && urlInput.value) showPreview(urlInput.value, 'Prévia da imagem por URL');
        else previewWrap.hidden = true;
        return;
      }

      if (!file.type.startsWith('image/')) {
        fileInput.setCustomValidity('Selecione um arquivo de imagem.');
        fileInput.reportValidity();
        fileInput.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        fileInput.setCustomValidity('A imagem deve ter no máximo 5 MB.');
        fileInput.reportValidity();
        fileInput.value = '';
        return;
      }

      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(file);
      showPreview(objectUrl, `Prévia da imagem selecionada: ${file.name}`);
    });

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        if (fileInput.files && fileInput.files.length) return;
        if (!urlInput.value.trim()) {
          previewWrap.hidden = true;
          return;
        }
        showPreview(urlInput.value.trim(), 'Prévia da imagem por URL');
      });
    }

    window.addEventListener('beforeunload', () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });
  }

  document.querySelectorAll('[data-confirm-delete]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!window.confirm(form.dataset.confirmDelete)) event.preventDefault();
    });
  });

  document.querySelectorAll('[data-share-recipe]').forEach((button) => {
    button.addEventListener('click', async () => {
      const feedback = document.querySelector('[data-share-feedback]');
      const shareData = { title: button.dataset.shareTitle, url: window.location.href };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          if (feedback) feedback.textContent = 'Receita compartilhada.';
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          if (feedback) feedback.textContent = 'Link copiado.';
        } else {
          window.prompt('Copie o link da receita:', shareData.url);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && feedback) feedback.textContent = 'Não foi possível compartilhar agora.';
      }
    });
  });
});
