"""Usage: python tools/librosa_mfcc_fixture.py <wav> <out.json>"""
import json
import sys

import librosa
import numpy as np
import scipy.fft

SR = 16000
N_MFCC = 13
MEL_PARAMS = dict(
    sr=SR,
    n_fft=512,
    win_length=400,
    hop_length=160,
    window="hann",
    center=False,
    power=2.0,
    n_mels=26,
    fmin=20,
    fmax=8000,
    htk=True,
    norm=None,
)
DB_PARAMS = dict(ref=1.0, amin=1e-10, top_db=80.0)


def main(wav_path: str, out_path: str) -> None:
    y, sr = librosa.load(wav_path, sr=None, mono=True)
    assert sr == SR, f"sample rate {sr}, expected {SR}"
    mel = librosa.feature.melspectrogram(y=y, **MEL_PARAMS)
    db = librosa.power_to_db(mel, **DB_PARAMS)
    mfcc = scipy.fft.dct(db, axis=0, type=2, norm="ortho")[:N_MFCC]
    with open(out_path, "w") as f:
        json.dump({"librosa": librosa.__version__, "mfcc": np.round(mfcc.T, 6).tolist()}, f)
    print(f"{mfcc.shape[1]} frames -> {out_path}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
