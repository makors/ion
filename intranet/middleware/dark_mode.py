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
            preferences = UserDarkModeProperties.get_preferences(request.user)

            enabled_override = getattr(request, "_dark_mode_enabled_override", None)
            enabled = bool(preferences.get("dark_mode_enabled") if enabled_override is None else enabled_override)

            valid_themes = {choice for choice, _ in UserDarkModeProperties.THEME_CHOICES}

            theme_override = getattr(request, "_dark_mode_theme_override", None)
            theme = theme_override or preferences.get("theme")
            if not theme:
                if enabled:
                    theme = request.COOKIES.get("dark-mode-theme") or UserDarkModeProperties.THEME_DARK_CLASSIC
                else:
                    theme = UserDarkModeProperties.THEME_LIGHT
            elif theme not in valid_themes:
                theme = UserDarkModeProperties.THEME_DARK_CLASSIC if enabled else UserDarkModeProperties.THEME_LIGHT

            response.set_cookie(
                "dark-mode-enabled",
                str(int(enabled)),
                max_age=30 * 24 * 60 * 60,
            )
            response.set_cookie(
                "dark-mode-theme",
                theme,
                max_age=30 * 24 * 60 * 60,
            )
        return response
