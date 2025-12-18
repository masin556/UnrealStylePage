# P_Elden Echoes

> [!NOTE]
> **Development Period**: 2023.01 - 2024.03 (1 Year 2 Months)  
> **Development Team**: 5 Developers, 3 Artists  
> **Project Purpose**: To explore advanced networking and GAS implementation in a dark fantasy setting.

![Banner]()

**Elden Echoes** is a dark fantasy RPG that pushes the boundaries of the Gameplay Ability System (GAS) in Unreal Engine 5.

## Key Features
- **Complex Combat**: Parry, dodge, and stance-break mechanics.
- **Multiplayer**: Fully replicated gameplay for up to 4 players.
- **AI**: Behavior Tree-based enemy AI with distinct phases.

[Youtube Link](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Technical Details
I was responsible for the core networking architecture.
```cpp
// Example logic (Pseudo)
void ACharacter::ActivateAbility() {
    if (HasAuthority()) {
        NetMulticast_PlayMontage();
    }
}
```
