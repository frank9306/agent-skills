//go:build windows

package main

import (
	"io"
	"os"
	"syscall"
)

func readSignal(path string) ([]byte, error) {
	name, err := syscall.UTF16PtrFromString(path)
	if err != nil {
		return nil, err
	}
	// The runner publishes updates by atomically replacing the signal file.
	// Sharing deletion allows the rename while this handle reads the old copy.
	handle, err := syscall.CreateFile(name, syscall.GENERIC_READ,
		syscall.FILE_SHARE_READ|syscall.FILE_SHARE_WRITE|syscall.FILE_SHARE_DELETE,
		nil, syscall.OPEN_EXISTING, syscall.FILE_ATTRIBUTE_NORMAL, 0)
	if err != nil {
		return nil, err
	}
	file := os.NewFile(uintptr(handle), path)
	defer file.Close()
	return io.ReadAll(io.LimitReader(file, 4097))
}
