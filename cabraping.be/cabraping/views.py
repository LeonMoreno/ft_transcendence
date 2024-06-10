from django.shortcuts import render
import os
import logging

logger = logging.getLogger(__name__)

def custom_404(request, exception):
    print("Custom 404 handler called")
    template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../cabraping.fe/src/template')
    print("Template directory:", template_dir)
    print("Contents:", os.listdir(template_dir))
    try:
        return render(request, '404.html', status=404)
    except Exception as e:
        logger.error(f"Error rendering 404 template: {e}")
        return render(request, '500.html', status=500)  # Fallback to a simple error page

