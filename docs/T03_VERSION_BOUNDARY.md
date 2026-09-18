# T03 version boundary — private image fingerprint, not original-rule certification

2026-09-18. This is a narrow continuation of version-difference research, not a replay of accepted chapters or an asset extraction.

The already-private Drive file1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM was fetched read-only. Its4194304 bytes and SHA256b61ca56a3baef8831211517138a8bfa4b89b82ae8bde558b53af704b30a4846a match the retained receipt. No new ROM upload, emulator execution, disassembly, sprite/font/audio extraction or public binary inclusion occurred.

The ordinary HiROM header candidate at file offset0xffc0 has ASCII title CHRONO TRIGGER, mapping byte0x31, cartridge type2, ROM exponent12, SRAM exponent3, region byte0 and revision byte0. Its stored checksum64390 (0xfb86) and complement1145 (0x0479) form a valid pair. The ordinary power-of-two byte sum is64474 (0xfbda), which does not match that stored checksum. No copier prefix was inferred by the file-length heuristic.

**Interpretation:** this header is internally plausible, but the file is not established as an unmodified reference revision. The stored filename labels it a Traditional Chinese Beta associated with Goldegg+Emukim; that filename alone does not authenticate a particular patch release or identify which event/number tables were changed. A checksum mismatch is not proof that the game is unplayable. Do not transplant an assumed US or Japanese jury algorithm into this image without checking the actual event data. No exact patch diff or original hidden rule has been decoded in this batch.

The parser is `scripts/rom_fingerprint.py`, and its metadata-only result is `evidence/T03_ROM_FINGERPRINT.json`. Six synthetic-header unit tests cover checksum comparison, optional prefix normalization, mismatch reporting, non-power-of-two limits and invalid inputs. CI runs those synthetic tests only; it does not download the private image. The parser deliberately does not normalize interleaving, BS-X or special-chip images and does not export raw header bytes.

Primary implementation reference: [Snes9x official memmap.cpp](https://github.com/snes9xgit/snes9x/blob/master/memmap.cpp), specifically InitROM header offset selection, ParseSNESHeader field offsets, Revision and Checksum_Calculate. Consulted2026-09-18. This script implements the limited ordinary-header observation, not the emulator's complete detection algorithm.

Still open: original hidden jury rules/flag edge cases; exact differences of this Beta image; full room/map topology and event staging; canonical item prices, damage formulas, growth and skill tables. The new T04 equipment subsystem uses explicitly provisional project prices/bonuses/400G allowance and must not be labeled ROM-derived because this header was inspected.
