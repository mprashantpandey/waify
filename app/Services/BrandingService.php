<?php

namespace App\Services;

use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Storage;

/**
 * Branding Service
 * 
 * Manages platform branding: name, logo, favicon, colors, etc.
 */
class BrandingService
{
    protected PlatformSettingsService $settingsService;

    public function __construct(PlatformSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get platform name.
     */
    public function getPlatformName(): string
    {
        return $this->settingsService->get('branding.platform_name', config('app.name', 'Waify'));
    }

    /**
     * Get platform logo URL.
     */
    public function getLogoUrl(): ?string
    {
        $logoPath = $this->settingsService->get('branding.logo_path');
        
        if (!$logoPath) {
            return null;
        }

        return Storage::url($logoPath);
    }

    /**
     * Get favicon URL.
     */
    public function getFaviconUrl(): ?string
    {
        $faviconPath = $this->settingsService->get('branding.favicon_path');
        
        if (!$faviconPath) {
            return null;
        }

        return Storage::url($faviconPath);
    }

    /**
     * Get primary color.
     */
    public function getPrimaryColor(): string
    {
        return $this->settingsService->get('branding.primary_color', '#3B82F6');
    }

    /**
     * Get secondary color.
     */
    public function getSecondaryColor(): string
    {
        return $this->settingsService->get('branding.secondary_color', '#8B5CF6');
    }

    /**
     * Get all branding settings.
     */
    public function getAll(): array
    {
        $showPoweredBy = $this->settingsService->get('branding.show_powered_by', false);
        // Ensure boolean type
        if (is_string($showPoweredBy)) {
            $showPoweredBy = $showPoweredBy === '1' || $showPoweredBy === 'true';
        }
        
        return [
            'platform_name' => $this->getPlatformName(),
            'logo_url' => $this->getLogoUrl(),
            'favicon_url' => $this->getFaviconUrl(),
            'primary_color' => $this->getPrimaryColor(),
            'secondary_color' => $this->getSecondaryColor(),
            'support_email' => $this->settingsService->get('branding.support_email'),
            'support_phone' => $this->settingsService->get('branding.support_phone'),
            'footer_text' => $this->settingsService->get('branding.footer_text'),
            'show_powered_by' => (bool) $showPoweredBy];
    }

    /**
     * Upload logo.
     */
    public function uploadLogo(\Illuminate\Http\UploadedFile $file): string
    {
        $path = $file->store('branding', 'public');
        PlatformSetting::set('branding.logo_path', $path, 'string', 'branding');
        return $path;
    }

    /**
     * Upload favicon.
     */
    public function uploadFavicon(\Illuminate\Http\UploadedFile $file): string
    {
        $path = $file->store('branding', 'public');
        PlatformSetting::set('branding.favicon_path', $path, 'string', 'branding');
        return $path;
    }
}

