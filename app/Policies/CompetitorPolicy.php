<?php

namespace App\Policies;

use App\Models\Competitor;
use App\Models\User;

class CompetitorPolicy
{
    public function view(User $user, Competitor $competitor): bool
    {
        return $user->id === $competitor->user_id;
    }

    public function update(User $user, Competitor $competitor): bool
    {
        return $user->id === $competitor->user_id;
    }

    public function delete(User $user, Competitor $competitor): bool
    {
        return $user->id === $competitor->user_id;
    }
}
