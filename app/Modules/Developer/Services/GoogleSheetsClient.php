<?php

namespace App\Modules\Developer\Services;

use App\Models\GoogleSheetsIntegration;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class GoogleSheetsClient
{
    public function appendRows(GoogleSheetsIntegration $integration, array $rows): array
    {
        $request = $this->authorizedRequest($integration);

        $response = $request->post(
            sprintf(
                'https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s:append',
                $integration->spreadsheet_id,
                rawurlencode($integration->sheet_name)
            ),
            [
                'valueInputOption' => 'USER_ENTERED',
                'insertDataOption' => 'INSERT_ROWS',
                'includeValuesInResponse' => false,
                'values' => $rows,
            ]
        );

        $response->throw();

        return $response->json();
    }

    protected function authorizedRequest(GoogleSheetsIntegration $integration): PendingRequest
    {
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $this->buildAssertion($integration),
        ]);

        $tokenResponse->throw();

        return Http::withToken((string) $tokenResponse->json('access_token'));
    }

    protected function buildAssertion(GoogleSheetsIntegration $integration): string
    {
        $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $now = now()->timestamp;
        $claims = $this->base64UrlEncode(json_encode([
            'iss' => $integration->service_account_email,
            'scope' => 'https://www.googleapis.com/auth/spreadsheets',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now,
        ]));

        $signingInput = $header . '.' . $claims;
        $signature = '';
        $privateKey = (string) $integration->service_account_private_key;
        $ok = openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);

        if (!$ok) {
            throw new \RuntimeException('Could not sign the Google service account assertion.');
        }

        return $signingInput . '.' . $this->base64UrlEncode($signature);
    }

    protected function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
