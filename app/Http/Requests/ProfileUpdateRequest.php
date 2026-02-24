<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentAccount = current_account();
        $phoneRequired = (bool) ($currentAccount?->phone_verification_required ?? false);

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id)],
            'phone' => [$phoneRequired ? 'required' : 'nullable', 'string', 'max:20']];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Phone number is required by your tenant security policy.',
        ];
    }
}
