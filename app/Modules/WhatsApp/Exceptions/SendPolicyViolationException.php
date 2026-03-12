<?php

namespace App\Modules\WhatsApp\Exceptions;

use RuntimeException;

class SendPolicyViolationException extends RuntimeException
{
    public function __construct(
        public readonly string $reasonCode,
        public readonly string $reasonMessage,
        public readonly int $httpStatus = 422
    ) {
        parent::__construct($reasonMessage, $httpStatus);
    }
}

