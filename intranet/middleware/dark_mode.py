from intranet.apps.users.models import UserDarkModeProperties


class DarkModeMiddleware:
    """
    Set the 'dark-mode-enabled' cookie if the user is logged in and has enabled dark mode
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user is not None and request.user.is_authenticated:
            try:
                dark_mode_properties = request.user.dark_mode_properties
            except UserDarkModeProperties.DoesNotExist:
                dark_mode_properties, _ = UserDarkModeProperties.objects.get_or_create(user=request.user)
            response.set_cookie(
                "dark-mode-enabled",
                str(int(bool(dark_mode_properties.dark_mode_enabled))),
                max_age=30 * 24 * 60 * 60,
            )
            response.set_cookie(
                "dark-mode-theme",
                dark_mode_properties.theme,
                max_age=30 * 24 * 60 * 60,
            )
        return response
