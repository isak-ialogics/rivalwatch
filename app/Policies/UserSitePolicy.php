<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserSite;

class UserSitePolicy
{
    public function view(User $user, UserSite $userSite): bool
    {
        return $user->id === $userSite->user_id;
    }

    public function update(User $user, UserSite $userSite): bool
    {
        return $user->id === $userSite->user_id;
    }

    public function delete(User $user, UserSite $userSite): bool
    {
        return $user->id === $userSite->user_id;
    }
}
