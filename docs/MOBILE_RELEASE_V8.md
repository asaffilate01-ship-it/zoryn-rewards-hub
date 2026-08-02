# Mobile release checklist (v8)

- [ ] Secure storage for session tokens (Keychain / Keystore), never plain preferences
- [ ] Biometric unlock wired and reflected in `zr_mobile_devices.biometric_enabled`
- [ ] Push registration stores only a hashed device token (`device_token_hash`)
- [ ] Device revocation available in-app and reflected via `revoked_at`
- [ ] Deep links verified (universal links / app links) for wallet and offers
- [ ] Camera permission strings for QR scanning in both stores
- [ ] iOS privacy manifest and Android data-safety form completed
- [ ] Crash and error reporting enabled in release builds
- [ ] Offline handling for wallet balance and scan flows
- [ ] Store screenshots, age rating and support URL final
